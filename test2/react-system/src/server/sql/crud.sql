-- mysql 参数化 sql 模板。每条语句单独交给后端驱动执行，? 由驱动绑定参数。
-- 写操作的用户 id、角色必须从服务端会话取得，不应信任浏览器提交的身份。
use dog_system;
-- 以下参数化模板和旧导入记录供查阅；在 workbench 中直接运行本文件时跳过。
/*
-- 用户：新增、按账号查询（登录）、按 id 查询、修改、删除。
-- 注册前由服务端对密码做 argon2/bcrypt 哈希；不要把明文密码写入数据库。


insert into dog_owners (dog_id, user_id, is_primary)
values (?, ?, true);
select d.id,
  d.name,
  d.breed,
  d.sex,
  d.age,
  d.vaccinated as vaccine,
  d.last_vaccinated_on as record,
  d.contact_phone as phone,
  d.license_number as number,
  d.status,
  primary_user.name as mastername
from dogs as d
  join dog_owners as current_owner on current_owner.dog_id = d.id
  left join dog_owners as primary_owner on primary_owner.dog_id = d.id
  and primary_owner.is_primary = true
  left join users as primary_user on primary_user.id = primary_owner.user_id
where current_owner.user_id = ?
order by d.created_at desc;
select d.id,
  d.name,
  d.breed,
  d.sex,
  d.age,
  d.vaccinated as vaccine,
  d.last_vaccinated_on as record,
  d.contact_phone as phone,
  d.license_number as number,
  d.status,
  primary_user.name as mastername
from dogs as d
  join dog_owners as current_owner on current_owner.dog_id = d.id
  left join dog_owners as primary_owner on primary_owner.dog_id = d.id
  and primary_owner.is_primary = true
  left join users as primary_user on primary_user.id = primary_owner.user_id
where d.id = ?
  and current_owner.user_id = ?;
-- 管理员全量列表；审核队列可再加 where d.status = 0。
select d.id,
  d.name,
  d.breed,
  d.sex,
  d.age,
  d.vaccinated as vaccine,
  d.status,
  primary_user.name as mastername
from dogs as d
  left join dog_owners as primary_owner on primary_owner.dog_id = d.id
  and primary_owner.is_primary = true
  left join users as primary_user on primary_user.id = primary_owner.user_id
order by d.created_at desc;
-- 居民修改犬只后重新进入待审核；exists 校验当前用户确实关联了该犬只。
update dogs
set name = ?,
  breed = ?,
  sex = ?,
  age = ?,
  vaccinated = ?,
  last_vaccinated_on = ?,
  contact_phone = ?,
  license_number = ?,
  status = 0
where id = ?
  and exists (
    select 1
    from dog_owners
    where dog_owners.dog_id = dogs.id
      and dog_owners.user_id = ?
  );
-- 删除犬只前，后端应在事务中锁定对应行，并确认该用户是唯一主人且犬只仍待审核。
-- 以下两条语句必须在同一事务中按顺序执行；任一步失败都应回滚。
delete from dog_owners
where dog_id = ?
  and user_id = ?;
delete from dogs
where id = ?
  and status = 0
  and not exists (
    select 1
    from dog_owners
    where dog_id = dogs.id
  );
-- 若还有其他主人，则只解除当前用户的关系，不删除其他人的犬只记录。
delete from dog_owners
where dog_id = ?
  and user_id = ?
  and (
    select count(*)
    from dog_owners as other_owner
    where other_owner.dog_id = dog_owners.dog_id
  ) > 1;
-- 管理员审核：第一个参数为 1（通过）或 2（拒绝）。
update dogs
set status = ?
where id = ?
  and status = 0;
-- 投诉：提交、查询、修改、撤销、处理。
insert into complaints (reporter_id, title, content)
values (?, ?, ?);
select c.id,
  c.title,
  c.content,
  c.created_at as time,
  c.status,
  c.handling_result,
  u.name
from complaints as c
  join users as u on u.id = c.reporter_id
where c.reporter_id = ?
order by c.created_at desc;
select c.id,
  c.title,
  c.content,
  c.created_at as time,
  c.status,
  c.handling_result,
  u.name
from complaints as c
  join users as u on u.id = c.reporter_id
where c.id = ?
  and c.reporter_id = ?;
-- 管理员待处理列表；处理历史可去掉 where 条件。
select c.id,
  c.title,
  c.content,
  c.created_at as time,
  c.status,
  u.name
from complaints as c
  join users as u on u.id = c.reporter_id
where c.status = 0
order by c.created_at;
update complaints
set title = ?,
  content = ?
where id = ?
  and reporter_id = ?
  and status = 0;
delete from complaints
where id = ?
  and reporter_id = ?
  and status = 0;
-- 管理员处理：status 只能传 1 或 2；handler_id 来自服务端会话。
update complaints
set status = ?,
  handler_id = ?,
  handling_result = ?,
  handled_at = current_timestamp
where id = ?
  and status = 0;
-- 公告：新增、公开查询、详情、修改、删除。写操作仅限管理员。
insert into announcements (author_id, title, content, published_at)
values (?, ?, ?, ?);
select a.id,
  a.title,
  a.content,
  a.published_at,
  u.name as author_name
from announcements as a
  join users as u on u.id = a.author_id
where a.published_at is not null
  and a.published_at <= current_timestamp
order by a.published_at desc;
select id,
  author_id,
  title,
  content,
  published_at,
  created_at,
  updated_at
from announcements
where id = ?;
update announcements
set title = ?,
  content = ?,
  published_at = ?
where id = ?;
delete from announcements
where id = ?;
-- 以下为 db.json 的具体数据；仅单独执行本区块，上方 ? 模板由后端绑定参数。
-- 先导入用户，再导入犬只和主人关系，最后导入可确定归属的待处理投诉。
-- 密码已转为 scrypt 哈希；旧数据冲突与未导入记录见 seed-report.json。
start transaction;
-- insert into users (account, password_hash, name, role) values ('zhangsan', 'scrypt$16384$8$1$89fe464ac0fa92238b675c31d0df3225$8c9c22077471d53a94e412cf891ddbb0bab337cf6b4259f33a06a283169e944c7b471e7d081c674176676d9d34796b368fa6720d5b41ad0fe5ab22eb6866a600', '张三', 'resident');
insert into users (account, password_hash, name, role)
values (
    'lisi',
    'scrypt$16384$8$1$ab672698b341b94ab1711e50ec0bc3ee$27f2fd59714c4e8e1f298e338cbd38fab6820a4eab5fee59a642c883ff09f2a014a7ec64449d9d9df0b9cc2142cb99cd4260c1cdc7edec33895a42d3e79a3aa6',
    '李四',
    'resident'
  );
insert into users (account, password_hash, name, role)
values (
    'wangwu',
    'scrypt$16384$8$1$13c277b49cc3a32dd10c5ad315f37481$95c8c6e2b2252554d28a73fae7d27b99a32e485024c1456f1861dd86df7f74ed44ae7b6aff89aaa71cd13f1ce9c6d60f8d8e9ee311c3ffa681444ca6ce9d0b74',
    '王五',
    'resident'
  );
insert into users (account, password_hash, name, role)
values (
    'admin',
    'scrypt$16384$8$1$3810413f802725d1a1b32192bea5ac2c$ea62d96d74bfba7642f821ca106c03afa5e0b4db0f3beb5e6c6b40264d002edef00cade69dd96ba2907083b5a8ec0cf9d1270604eca0cc2e3b9db286772775f8',
    '管理员1',
    'admin'
  );
insert into dogs (
    name,
    breed,
    sex,
    age,
    vaccinated,
    last_vaccinated_on,
    contact_phone,
    license_number,
    status
  )
values (
    '大柴',
    '柴犬',
    '雄性',
    3,
    1,
    '2025-08-01',
    '13800000000',
    '001',
    1
  );
insert into dog_owners (dog_id, user_id, is_primary)
values (
    last_insert_id(),
    (
      select id
      from users
      where account = 'zhangsan'
    ),
    true
  );
insert into dogs (
    name,
    breed,
    sex,
    age,
    vaccinated,
    last_vaccinated_on,
    contact_phone,
    license_number,
    status
  )
values (
    '小b',
    '金毛',
    '雄性',
    3,
    1,
    '2025-08-01',
    '13800000000',
    '002',
    2
  );
insert into dog_owners (dog_id, user_id, is_primary)
values (
    last_insert_id(),
    (
      select id
      from users
      where account = 'zhangsan'
    ),
    true
  );
insert into dogs (
    name,
    breed,
    sex,
    age,
    vaccinated,
    last_vaccinated_on,
    contact_phone,
    license_number,
    status
  )
values (
    '小c',
    '柴犬',
    '雄性',
    3,
    1,
    '2025-08-01',
    '13800000000',
    '003',
    1
  );
insert into dog_owners (dog_id, user_id, is_primary)
values (
    last_insert_id(),
    (
      select id
      from users
      where account = 'lisi'
    ),
    true
  );
insert into dogs (
    name,
    breed,
    sex,
    age,
    vaccinated,
    last_vaccinated_on,
    contact_phone,
    license_number,
    status
  )
values (
    '大金',
    '金毛',
    '雄性',
    2,
    1,
    '2026-02-03',
    '12345678',
    '123456',
    1
  );
insert into dog_owners (dog_id, user_id, is_primary)
values (
    last_insert_id(),
    (
      select id
      from users
      where account = 'zhangsan'
    ),
    true
  );
insert into dogs (
    name,
    breed,
    sex,
    age,
    vaccinated,
    last_vaccinated_on,
    contact_phone,
    license_number,
    status
  )
values (
    '旺财',
    '中华田园犬',
    '雌性',
    1,
    1,
    '2026-02-21',
    '12345678',
    null,
    1
  );
insert into dog_owners (dog_id, user_id, is_primary)
values (
    last_insert_id(),
    (
      select id
      from users
      where account = 'zhangsan'
    ),
    true
  );
insert into dogs (
    name,
    breed,
    sex,
    age,
    vaccinated,
    last_vaccinated_on,
    contact_phone,
    license_number,
    status
  )
values (
    '测试',
    '金毛',
    '雄性',
    2,
    0,
    null,
    '12345678',
    null,
    2
  );
insert into dog_owners (dog_id, user_id, is_primary)
values (
    last_insert_id(),
    (
      select id
      from users
      where account = 'zhangsan'
    ),
    true
  );
insert into dogs (
    name,
    breed,
    sex,
    age,
    vaccinated,
    last_vaccinated_on,
    contact_phone,
    license_number,
    status
  )
values (
    '待审核的旺旺',
    '金毛',
    '雄性',
    2,
    1,
    '2026-02-21',
    '12345678',
    '005',
    0
  );
insert into dog_owners (dog_id, user_id, is_primary)
values (
    last_insert_id(),
    (
      select id
      from users
      where account = 'zhangsan'
    ),
    true
  );
insert into dogs (
    name,
    breed,
    sex,
    age,
    vaccinated,
    last_vaccinated_on,
    contact_phone,
    license_number,
    status
  )
values (
    'a',
    '金毛',
    '雌性',
    2,
    1,
    '2026-04-17',
    '18660278715',
    null,
    0
  );
insert into dog_owners (dog_id, user_id, is_primary)
values (
    last_insert_id(),
    (
      select id
      from users
      where account = 'zhangsan'
    ),
    true
  );
insert into complaints (reporter_id, title, content, created_at)
values (
    (
      select id
      from users
      where account = 'zhangsan'
    ),
    '王五遛狗不牵绳',
    '王五遛狗不牵绳',
    '2025-09-01 00:00:00'
  );
commit;


*/

-- 补录已存在的犬只与投诉：只单独执行本区块，不要重跑上方的用户和犬只插入语句。
-- 根据 db.json，犬证编号 001 的大柴属于张三；只有尚无主人关系时才补录。
use dog_system;
start transaction;
insert into dog_owners (dog_id, user_id, is_primary)
select d.id, u.id, true
from dogs as d
join users as u on u.account = 'zhangsan'
where d.license_number = '001'
  and d.name = '大柴'
  and not exists (
    select 1 from dog_owners as owner where owner.dog_id = d.id
  );

-- 旧投诉中只有这条待处理记录有明确投诉人；重复执行时不再插入相同记录。
insert into complaints (reporter_id, title, content, created_at)
select u.id, '王五遛狗不牵绳', '王五遛狗不牵绳', '2025-09-01 00:00:00'
from users as u
where u.account = 'zhangsan'
  and not exists (
    select 1 from complaints as c
    where c.reporter_id = u.id
      and c.content = '王五遛狗不牵绳'
      and c.created_at = '2025-09-01 00:00:00'
  );
commit;

-- 首页演示数据：依赖 seed.sql 中已有的居民和管理员账号，可重复执行。
-- 犬证编号用于识别本批犬只；未接种犬只的最近接种日期保持为空。
use dog_system;
start transaction;
insert into dogs (
  name, breed, sex, age, vaccinated, last_vaccinated_on,
  contact_phone, license_number, status, created_at
)
select sample.name, sample.breed, sample.sex, sample.age, sample.vaccinated,
  sample.last_vaccinated_on, sample.contact_phone, sample.license_number,
  sample.status, sample.created_at
from (
  select '团团' as name, '柯基犬' as breed, '雌性' as sex, 2 as age,
    1 as vaccinated, '2026-05-12' as last_vaccinated_on,
    '13800000001' as contact_phone, 'DEMO-2026-001' as license_number,
    1 as status, '2026-09-05 10:20:00' as created_at, 'lisi' as owner_account
  union all
  select '豆包', '比熊犬', '雄性', 1, 1, '2026-07-18',
    '13800000001', 'DEMO-2026-002', 0, '2026-11-18 09:30:00', 'lisi'
  union all
  select '阿福', '拉布拉多犬', '雄性', 4, 0, null,
    '13800000001', 'DEMO-2026-003', 2, '2026-10-12 14:10:00', 'lisi'
  union all
  select '小满', '中华田园犬', '雌性', 3, 1, '2026-06-08',
    '13800000002', 'DEMO-2026-004', 1, '2026-08-22 16:45:00', 'wangwu'
  union all
  select '可乐', '边境牧羊犬', '雄性', 2, 1, '2026-09-20',
    '13800000002', 'DEMO-2026-005', 0, '2026-11-21 11:05:00', 'wangwu'
  union all
  select '栗子', '柴犬', '雌性', 1, 0, null,
    '13800000002', 'DEMO-2026-006', 2, '2026-10-28 15:35:00', 'wangwu'
) as sample
join users as resident on resident.account = sample.owner_account
  and resident.role = 'resident'
where not exists (
  select 1 from dogs as existing
  where existing.license_number = sample.license_number
);

insert into dog_owners (dog_id, user_id, is_primary)
select d.id, u.id, true
from dogs as d
join users as u on u.account = case d.license_number
  when 'DEMO-2026-001' then 'lisi'
  when 'DEMO-2026-002' then 'lisi'
  when 'DEMO-2026-003' then 'lisi'
  when 'DEMO-2026-004' then 'wangwu'
  when 'DEMO-2026-005' then 'wangwu'
  when 'DEMO-2026-006' then 'wangwu'
end and u.role = 'resident'
where d.license_number in (
  'DEMO-2026-001', 'DEMO-2026-002', 'DEMO-2026-003',
  'DEMO-2026-004', 'DEMO-2026-005', 'DEMO-2026-006'
)
  and not exists (
    select 1 from dog_owners as existing where existing.dog_id = d.id
  );

-- 待处理投诉不填写处理信息；已处理和已驳回投诉均关联管理员及处理结果。
insert into complaints (
  reporter_id, title, content, status, handler_id,
  handling_result, created_at, handled_at
)
select reporter.id, sample.title, sample.content, sample.status,
  case when sample.status = 0 then null else admin.id end,
  sample.handling_result, sample.created_at, sample.handled_at
from (
  select 'zhangsan' as reporter_account, '夜间遛犬噪声影响休息' as title,
    '11月24日晚，3号楼附近有犬只持续吠叫，希望提醒犬主注意夜间管理。' as content,
    0 as status, null as handling_result,
    '2026-11-25 08:40:00' as created_at, null as handled_at
  union all
  select 'lisi', '公共区域未清理犬只排泄物',
    '11月22日早上，北门步道有犬只排泄物未及时清理，请协助巡查。',
    0, null, '2026-11-22 09:15:00', null
  union all
  select 'wangwu', '犬只在儿童活动区未牵绳',
    '10月15日下午，儿童活动区有犬只未牵绳，存在安全隐患。',
    1, '已联系犬主并提醒在公共区域牵绳，物业已加强活动区巡查。',
    '2026-10-15 17:20:00', '2026-10-16 14:30:00'
  union all
  select 'zhangsan', '单元门口犬只长时间吠叫',
    '9月12日晚上，2号楼单元门口有犬只长时间吠叫。',
    1, '已与犬主沟通，犬主承诺调整遛犬时间并看护犬只。',
    '2026-09-13 08:10:00', '2026-09-14 10:00:00'
  union all
  select 'lisi', '疑似流浪犬在小区内活动',
    '10月3日看到一只无人看管的犬只在小区南侧活动，希望核实。',
    2, '核实后为住户正常陪同遛犬，暂未发现流浪犬。',
    '2026-10-03 16:50:00', '2026-10-04 11:25:00'
) as sample
join users as reporter on reporter.account = sample.reporter_account
  and reporter.role = 'resident'
left join users as admin on admin.account = 'admin' and admin.role = 'admin'
where (sample.status = 0 or admin.id is not null)
  and not exists (
    select 1 from complaints as existing
    where existing.reporter_id = reporter.id and existing.title = sample.title
  );

-- 已发布公告使用过去的发布时间；空发布时间表示草稿。
insert into announcements (author_id, title, content, published_at, created_at)
select admin.id, sample.title, sample.content,
  sample.published_at, sample.created_at
from (
  select '文明养犬与牵绳提醒' as title,
    '请居民在小区公共区域为犬只佩戴牵引绳，主动避让老人和儿童，并及时清理犬只排泄物。' as content,
    '2026-09-01 09:00:00' as published_at,
    '2026-08-30 15:00:00' as created_at
  union all
  select '秋季犬只免疫登记通知',
    '请尚未完成年度免疫的犬主携带免疫证明，及时更新犬只登记信息。',
    '2026-10-08 10:00:00', '2026-10-07 14:30:00'
  union all
  select '公共区域养犬管理提示',
    '遛犬时请避开儿童活动区，不让犬只进入绿化养护区域，共同维护社区环境。',
    '2026-11-05 08:30:00', '2026-11-04 16:20:00'
  union all
  select '犬只登记信息核对提醒',
    '请居民核对犬只联系方式和免疫日期；信息发生变化时，请及时提交更新。',
    '2026-11-20 09:00:00', '2026-11-19 13:40:00'
  union all
  select '冬季文明养犬宣传计划',
    '拟开展冬季文明养犬宣传活动，具体时间和地点待确认后发布。',
    null, '2026-11-26 10:15:00'
) as sample
join users as admin on admin.account = 'admin' and admin.role = 'admin'
where not exists (
  select 1 from announcements as existing
  where existing.author_id = admin.id and existing.title = sample.title
);
commit;
