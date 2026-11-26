import { Router } from 'express'
import type { RowDataPacket } from 'mysql2/promise'
import { requireAdmin, requireResident, requireUser, type User } from '../auth.ts'
import { change, rows } from '../db.ts'
import { body, HttpError, positiveId, requiredText, statusValue } from '../http.ts'

const router = Router()

interface ComplaintRow extends RowDataPacket {
  id: number
  title: string
  content: string
  time: string
  status: number
  name: string
  handlingResult: string | null
}

const fields = `c.id, c.title, c.content, c.created_at as time, c.status,
  c.handling_result as handlingResult, u.name`
const joins = 'from complaints c join users u on u.id = c.reporter_id'

router.get('/', requireUser, async (req, res) => {
  const user = res.locals.user as User
  const status = req.query.status === undefined ? null : Number(req.query.status)
  if (status !== null && ![0, 1, 2].includes(status)) throw new HttpError(400, '状态无效')
  const conditions = user.role === 'resident' ? ['c.reporter_id = ?'] : []
  const params: unknown[] = user.role === 'resident' ? [user.id] : []
  if (status !== null) {
    conditions.push('c.status = ?')
    params.push(status)
  }
  const where = conditions.length ? `where ${conditions.join(' and ')}` : ''
  res.json(await rows<ComplaintRow>(`select ${fields} ${joins} ${where} order by c.created_at desc, c.id desc`, params))
})

router.post('/', requireUser, requireResident, async (req, res) => {
  const input = body(req.body)
  const title = requiredText(input.title, '投诉标题', 100)
  const content = requiredText(input.content, '投诉内容', 10000)
  const user = res.locals.user as User
  const result = await change('insert into complaints (reporter_id, title, content) values (?, ?, ?)', [user.id, title, content])
  res.status(201).json({ id: result.insertId, title, content, status: 0, name: user.name })
})

router.put('/:id', requireUser, requireResident, async (req, res) => {
  const id = positiveId(req.params.id)
  const input = body(req.body)
  const title = requiredText(input.title, '投诉标题', 100)
  const content = requiredText(input.content, '投诉内容', 10000)
  const result = await change(
    'update complaints set title = ?, content = ? where id = ? and reporter_id = ? and status = 0',
    [title, content, id, (res.locals.user as User).id],
  )
  if (!result.affectedRows) throw new HttpError(409, '投诉不存在或不能修改')
  res.json({ id, title, content, status: 0 })
})

router.delete('/:id', requireUser, requireResident, async (req, res) => {
  const id = positiveId(req.params.id)
  const result = await change(
    'delete from complaints where id = ? and reporter_id = ? and status = 0',
    [id, (res.locals.user as User).id],
  )
  if (!result.affectedRows) throw new HttpError(409, '投诉不存在或不能撤销')
  res.status(204).end()
})

router.patch('/:id/handle', requireUser, requireAdmin, async (req, res) => {
  const id = positiveId(req.params.id)
  const input = body(req.body)
  const status = statusValue(input.status)
  const handlingResult = requiredText(input.handlingResult, '处理结果', 10000)
  const result = await change(
    `update complaints set status = ?, handler_id = ?, handling_result = ?, handled_at = current_timestamp
     where id = ? and status = 0`,
    [status, (res.locals.user as User).id, handlingResult, id],
  )
  if (!result.affectedRows) throw new HttpError(409, '投诉不存在或已经处理')
  res.json({ id, status, handlingResult })
})

export default router
