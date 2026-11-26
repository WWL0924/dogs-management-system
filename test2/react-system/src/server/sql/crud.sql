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
