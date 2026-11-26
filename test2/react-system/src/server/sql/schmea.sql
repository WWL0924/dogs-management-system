-- 表结构
use dog_system;
-- 居民和管理员共用账号表，账号在全系统内唯一。
create table if not exists users (
  id bigint unsigned not null auto_increment comment '用户主键',
  account varchar(50) not null comment '登录账号，全系统唯一',
  password_hash varchar(255) not null comment '密码哈希，不存储明文密码',
  name varchar(50) not null comment '用户姓名或显示名称',
  role enum('resident', 'admin') not null comment '用户角色：居民或管理员',
  created_at datetime not null default current_timestamp comment '创建时间',
  updated_at datetime not null default current_timestamp on update current_timestamp comment '最后更新时间',
  primary key (id),
  constraint uq_users_account unique (account),
  constraint chk_users_account_nonempty check (char_length(trim(account)) > 0),
  constraint chk_users_name_nonempty check (char_length(trim(name)) > 0),
  constraint chk_users_password_hash_nonempty check (char_length(trim(password_hash)) > 0)
) engine = innodb comment = '居民和管理员账号';
-- 犬只基础信息与主人关系分表保存；一只犬可关联多个用户，一个用户也可关联多只犬。
create table if not exists dogs (
  id bigint unsigned not null auto_increment comment '犬只主键',
  name varchar(50) not null comment '犬只姓名',
  breed varchar(80) not null comment '犬只品种',
  sex enum('雌性', '雄性') not null comment '犬只性别',
  age tinyint unsigned not null comment '犬只年龄，单位为岁',
  vaccinated boolean not null default false comment '是否已接种疫苗',
  last_vaccinated_on date null comment '最近一次接种日期',
  contact_phone varchar(20) null comment '犬只联系联系电话',
  license_number varchar(50) null comment '犬证编号，允许待办理时为空',
  status tinyint unsigned not null default 0 comment '登记状态：0待审核、1通过、2拒绝',
  created_at datetime not null default current_timestamp comment '登记时间',
  updated_at datetime not null default current_timestamp on update current_timestamp comment '最后更新时间',
  primary key (id),
  constraint uq_dogs_license_number unique (license_number),
  constraint chk_dogs_age check (
    age between 0 and 30
  ),
  constraint chk_dogs_vaccinated check (vaccinated in (0, 1)),
  constraint chk_dogs_vaccination_date check (
    vaccinated = 1
    or last_vaccinated_on is null
  ),
  constraint chk_dogs_status check (status in (0, 1, 2)),
  constraint chk_dogs_name_nonempty check (char_length(trim(name)) > 0),
  constraint chk_dogs_breed_nonempty check (char_length(trim(breed)) > 0),
  constraint chk_dogs_license_nonempty check (
    license_number is null
    or char_length(trim(license_number)) > 0
  ),
  index idx_dogs_status (status)
) engine = innodb comment = '犬只登记及基础健康信息';
-- 关系表：每一行表示一个用户与一只犬的归属关系。
create table if not exists dog_owners (
  id bigint unsigned not null auto_increment comment '关系记录主键',
  dog_id bigint unsigned not null comment '犬只 id',
  user_id bigint unsigned not null comment '主人用户 id',
  is_primary boolean not null default false comment '是否为主要联系人',
  primary_dog_id bigint unsigned generated always as (
    case
      when is_primary = 1 then dog_id
      else null
    end
  ) stored comment '用于保证每只犬最多一个主要联系人',
  created_at datetime not null default current_timestamp comment '建立关系的时间',
  primary key (id),
  constraint uq_dog_owners_pair unique (dog_id, user_id),
  constraint uq_dog_owners_primary unique (primary_dog_id),
  -- 犬只与主人有关联记录就会拒绝删除犬只
  constraint fk_dog_owners_dog foreign key (dog_id) references dogs (id) on delete restrict,
  constraint fk_dog_owners_user foreign key (user_id) references users (id) on delete restrict,
  constraint chk_dog_owners_primary check (is_primary in (0, 1)),
  index idx_dog_owners_user_dog (user_id, dog_id)
) engine = innodb comment = '犬只与主人多对多关系；每只犬最多一个主要联系人';
-- 投诉状态：0 待处理，1 已处理，2 已驳回。
create table if not exists complaints (
  id bigint unsigned not null auto_increment comment '投诉主键',
  reporter_id bigint unsigned not null comment '投诉人用户 id',
  title varchar(100) not null comment '投诉标题',
  content text not null comment '投诉内容',
  status tinyint unsigned not null default 0 comment '处理状态：0待处理、1已处理、2已驳回',
  handler_id bigint unsigned null comment '处理人用户 id',
  handling_result text null comment '处理结果或驳回原因',
  created_at datetime not null default current_timestamp comment '投诉提交时间',
  handled_at datetime null comment '处理完成时间',
  updated_at datetime not null default current_timestamp on update current_timestamp comment '最后更新时间',
  primary key (id),
  constraint fk_complaints_reporter foreign key (reporter_id) references users (id) on delete restrict,
  constraint fk_complaints_handler foreign key (handler_id) references users (id) on delete restrict,
  constraint chk_complaints_status check (status in (0, 1, 2)),
  constraint chk_complaints_title_nonempty check (char_length(trim(title)) > 0),
  constraint chk_complaints_content_nonempty check (char_length(trim(content)) > 0),
  constraint chk_complaints_handling check (
    (
      status = 0
      and handler_id is null
      and handling_result is null
      and handled_at is null
    )
    or (
      status in (1, 2)
      and handler_id is not null
      and handling_result is not null
      and char_length(trim(handling_result)) > 0
      and handled_at is not null
    )
  ),
  index idx_complaints_reporter_status (reporter_id, status),
  index idx_complaints_status_created (status, created_at)
) engine = innodb comment = '居民投诉及管理员处理记录';
-- 首页公告；published_at 为空表示草稿。
create table if not exists announcements (
  id bigint unsigned not null auto_increment comment '公告主键',
  author_id bigint unsigned not null comment '发布人用户 id',
  title varchar(100) not null comment '公告标题',
  content text not null comment '公告正文',
  published_at datetime null comment '发布时间；为空时表示草稿',
  created_at datetime not null default current_timestamp comment '创建时间',
  updated_at datetime not null default current_timestamp on update current_timestamp comment '最后更新时间',
  primary key (id),
  -- userid被announcements.author_id 引用，删除该用户会被拒绝
  constraint fk_announcements_author foreign key (author_id) references users (id) on delete restrict,
  constraint chk_announcements_title_nonempty check (char_length(trim(title)) > 0),
  constraint chk_announcements_content_nonempty check (char_length(trim(content)) > 0),
  index idx_announcements_published_at (published_at)
) engine = innodb comment = '社区公告';