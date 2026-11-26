import { Router } from 'express'
import { issueToken, hashPassword, requireUser, verifyPassword, type User } from '../auth.ts'
import { change, rows } from '../db.ts'
import { body, HttpError, requiredText } from '../http.ts'

const router = Router()

router.post('/register', async (req, res) => {
  const input = body(req.body)
  if (input.role && input.role !== 'resident') throw new HttpError(403, '管理员账号不能自行注册')
  const account = requiredText(input.account, '账号', 50)
  const name = requiredText(input.name, '姓名', 50)
  const password = requiredText(input.password, '密码', 128)
  if (password.length < 6) throw new HttpError(400, '密码至少6位')
  const result = await change(
    "insert into users (account, password_hash, name, role) values (?, ?, ?, 'resident')",
    [account, await hashPassword(password), name],
  )
  res.status(201).json({ id: result.insertId, account, name, role: 'resident' })
})

router.post('/login', async (req, res) => {
  const input = body(req.body)
  const account = requiredText(input.account, '账号', 50)
  const password = requiredText(input.password, '密码', 128)
  const [user] = await rows<User>('select id, account, password_hash, name, role from users where account = ?', [account])
  if (!user || !await verifyPassword(password, user.password_hash || '') || (input.role && user.role !== input.role)) {
    throw new HttpError(401, '账号或密码错误')
  }
  res.json({ token: await issueToken(user), user: { id: user.id, account: user.account, name: user.name, role: user.role } })
})

router.get('/me', requireUser, (_req, res) => {
  const { id, account, name, role } = res.locals.user as User
  res.json({ id, account, name, role })
})

export default router
