import { Router } from 'express'
import type { RowDataPacket } from 'mysql2/promise'
import { requireAdmin, requireUser, type User } from '../auth.ts'
import { change, rows } from '../db.ts'
import { body, HttpError, positiveId, requiredText } from '../http.ts'

const router = Router()

interface Announcement extends RowDataPacket {
  id: number
  title: string
  content: string
  publishedAt: string | null
  authorName: string
}

router.get('/', async (_req, res) => {
  res.json(await rows<Announcement>(
    `select a.id, a.title, a.content, a.published_at as publishedAt, u.name as authorName
     from announcements a join users u on u.id = a.author_id
     where a.published_at is not null and a.published_at <= current_timestamp
     order by a.published_at desc`,
  ))
})

router.get('/manage', requireUser, requireAdmin, async (_req, res) => {
  res.json(await rows<Announcement>(
    `select a.id, a.title, a.content, a.published_at as publishedAt, u.name as authorName
     from announcements a join users u on u.id = a.author_id order by a.created_at desc`,
  ))
})

router.get('/:id', async (req, res) => {
  const [item] = await rows<Announcement>(
    `select a.id, a.title, a.content, a.published_at as publishedAt, u.name as authorName
     from announcements a join users u on u.id = a.author_id
     where a.id = ? and a.published_at <= current_timestamp`,
    [positiveId(req.params.id)],
  )
  if (!item) throw new HttpError(404, '公告不存在')
  res.json(item)
})

router.post('/', requireUser, requireAdmin, async (req, res) => {
  const input = body(req.body)
  const title = requiredText(input.title, '公告标题', 100)
  const content = requiredText(input.content, '公告正文', 10000)
  const publishedAt = input.publish === true ? new Date() : null
  const result = await change(
    'insert into announcements (author_id, title, content, published_at) values (?, ?, ?, ?)',
    [(res.locals.user as User).id, title, content, publishedAt],
  )
  res.status(201).json({ id: result.insertId, title, content, publishedAt })
})

router.put('/:id', requireUser, requireAdmin, async (req, res) => {
  const id = positiveId(req.params.id)
  const input = body(req.body)
  const title = requiredText(input.title, '公告标题', 100)
  const content = requiredText(input.content, '公告正文', 10000)
  const [previous] = await rows<Announcement>(
    'select id, published_at as publishedAt from announcements where id = ?', [id],
  )
  if (!previous) throw new HttpError(404, '公告不存在')
  const publishedAt = input.publish === true ? previous.publishedAt || new Date() : null
  await change('update announcements set title = ?, content = ?, published_at = ? where id = ?',
    [title, content, publishedAt, id])
  res.json({ id, title, content, publishedAt })
})

router.delete('/:id', requireUser, requireAdmin, async (req, res) => {
  const result = await change('delete from announcements where id = ?', [positiveId(req.params.id)])
  if (!result.affectedRows) throw new HttpError(404, '公告不存在')
  res.status(204).end()
})

export default router
