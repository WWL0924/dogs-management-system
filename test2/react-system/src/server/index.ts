import express, { type ErrorRequestHandler } from 'express'
import { pathToFileURL } from 'node:url'
import accounts from './routes/accounts.ts'
import dogs from './routes/dogs.ts'
import complaints from './routes/complaints.ts'
import announcements from './routes/announcements.ts'
import { pool } from './db.ts'
import { HttpError } from './http.ts'

const app = express()
export { app }
app.disable('x-powered-by')
app.use(express.json({ limit: '64kb' }))

app.get('/api/health', async (_req, res) => {
  //测试数据库返回正常
  await pool.query('select 1')

  //这里如果数据库异常,会中断
  res.json({ ok: true })
})
app.use('/api/auth', accounts)
app.use('/api/dogs', dogs)
app.use('/api/complaints', complaints)
app.use('/api/announcements', announcements)
app.use((_req, _res, next) => next(new HttpError(404, '接口不存在')))

const handleError: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
  void _next
  if (error instanceof HttpError) return void res.status(error.status).json({ message: error.message })
  const code = (error as { code?: string })?.code
  if (code === 'ER_DUP_ENTRY') return void res.status(409).json({ message: '账号或犬证编号已存在' })
  if (error instanceof SyntaxError && 'body' in error) return void res.status(400).json({ message: 'JSON格式无效' })
  console.error(error)
  res.status(500).json({ message: '服务器内部错误' })
}
app.use(handleError)

//先启动数据库(3306)再启动后端(4000)
const port = Number(process.env.PORT || 4000)
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT 无效')
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await pool.query('select 1')
  app.listen(port, () => console.log(`API: http://localhost:${port}/api`))
}
