# 后端运行

需要 Node.js 22.18+（项目使用 Node 的 TypeScript 直接运行能力）和 MySQL 8.0.16+。

1. 在 MySQL 中执行 `sql/schmea.sql` 建表。需要演示数据时，只在空表执行一次 `sql/seed.sql`。旧数据的取舍见 `sql/seed-report.json`。
2. 按 `.env.example` 配置本目录的 `.env`。数据库账号需要对 `dog_system` 中的表拥有 SELECT、INSERT、UPDATE、DELETE 权限。建议设置至少 32 字节的 `JWT_SECRET`；不设置时会临时生成，重启服务将使旧登录失效。
3. 在项目根目录运行 `npm run server:dev` 启动 API，再运行 `npm run dev` 启动前端。前端开发服务器会将 `/api` 代理到 `http://localhost:4000`。

生产环境的前端需要在构建前设置 `VITE_API_BASE_URL` 为后端公开地址，并由部署环境配置跨域或反向代理。静态站点自身不包含 MySQL 服务。

## 接口

| 方法 | 路径 | 权限 | 用途 |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | 公开 | 注册居民；账号、姓名、密码 |
| POST | `/api/auth/login` | 公开 | 登录，返回 token 和用户信息 |
| GET | `/api/auth/me` | 登录 | 当前用户 |
| GET | `/api/dogs/count` | 公开 | 犬只登记总数 |
| GET | `/api/dogs` | 登录 | 居民仅看自己的犬只；管理员看全部，可用 `?status=0` 筛选 |
| GET | `/api/dogs/:id` | 登录 | 犬只详情，居民仅看自己的 |
| POST | `/api/dogs` | 居民 | 登记犬只，自动绑定当前用户，状态为待审核 |
| PUT | `/api/dogs/:id` | 犬只主人 | 编辑并重新进入待审核 |
| DELETE | `/api/dogs/:id` | 犬只主人 | 撤销待审核登记；多主人时仅解除当前用户关系 |
| PATCH | `/api/dogs/:id/review` | 管理员 | 审核，传 `status: 1` 或 `2` |
| GET | `/api/complaints` | 登录 | 居民仅看自己的投诉；管理员看全部，可按状态筛选 |
| POST | `/api/complaints` | 居民 | 提交标题和内容 |
| PUT | `/api/complaints/:id` | 投诉人 | 修改待处理投诉 |
| DELETE | `/api/complaints/:id` | 投诉人 | 撤销待处理投诉 |
| PATCH | `/api/complaints/:id/handle` | 管理员 | 传 `status` 和 `handlingResult` |
| GET | `/api/announcements` | 公开 | 已发布公告 |
| GET | `/api/announcements/manage` | 管理员 | 所有公告和草稿 |
| GET | `/api/announcements/:id` | 公开 | 已发布公告详情 |
| POST/PUT/DELETE | `/api/announcements`、`/api/announcements/:id` | 管理员 | 公告管理，`publish: true` 表示发布 |

登录后的请求使用 `Authorization: Bearer <token>`。接口以数据库用户 ID 判断归属，忽略浏览器提交的主人姓名、投诉人和审核身份。密码使用与现有种子数据一致的 scrypt 格式。
