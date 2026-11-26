import { Router } from 'express'
import type { RowDataPacket } from 'mysql2/promise'
import { requireAdmin, requireResident, requireUser, type User } from '../auth.ts'
import { change, pool, rows } from '../db.ts'
import { body, HttpError, optionalText, positiveId, requiredText, statusValue } from '../http.ts'

const router = Router()

interface DogRow extends RowDataPacket {
  id: number
  name: string
  breed: string
  sex: string
  age: number
  vaccine: number
  record: string | null
  phone: string | null
  number: string | null
  status: number
  masterName: string | null
}

const fields = `d.id, d.name, d.breed, d.sex, d.age, d.vaccinated as vaccine,
  d.last_vaccinated_on as record, d.contact_phone as phone,
  d.license_number as number, d.status, u.name as masterName`
const joins = `from dogs d
  left join dog_owners primary_owner on primary_owner.dog_id = d.id and primary_owner.is_primary = 1
  left join users u on u.id = primary_owner.user_id`

function present(row: DogRow) {
  return { ...row, vaccine: Boolean(row.vaccine), age: String(row.age) }
}

function dateOnly(value: unknown): string | null {
  if (value == null || value === '') return null
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(value)) {
    throw new HttpError(400, '接种日期格式无效')
  }
  if (value.length === 10) {
    const date = new Date(`${value}T00:00:00Z`)
    if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
      throw new HttpError(400, '接种日期格式无效')
    }
    return value
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) throw new HttpError(400, '接种日期格式无效')
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Shanghai' }).format(date)
}

function dogInput(input: Record<string, unknown>) {
  const name = requiredText(input.name, '犬只姓名', 50)
  const breed = requiredText(input.breed, '品种', 80)
  if (input.sex !== '雌性' && input.sex !== '雄性') throw new HttpError(400, '性别无效')
  const age = Number(input.age)
  if (!Number.isInteger(age) || age < 0 || age > 30) throw new HttpError(400, '年龄需为0至30的整数')
  if (typeof input.vaccine !== 'boolean') throw new HttpError(400, '接种状态必须为布尔值')
  const record = dateOnly(input.record)
  if (!input.vaccine && record) throw new HttpError(400, '未接种不能填写接种日期')
  return {
    name, breed, sex: input.sex, age, vaccine: input.vaccine, record,
    phone: optionalText(input.phone, '联系电话', 20),
    number: optionalText(input.number, '犬证编号', 50),
  }
}

router.get('/count', async (_req, res) => {
  const [result] = await rows<RowDataPacket>('select count(*) as count from dogs')
  res.json({ count: result.count })
})

router.get('/', requireUser, async (req, res) => {
  const user = res.locals.user as User
  const status = req.query.status === undefined ? null : Number(req.query.status)
  if (status !== null && ![0, 1, 2].includes(status)) throw new HttpError(400, '状态无效')
  const where = user.role === 'resident'
    ? 'where exists (select 1 from dog_owners owner where owner.dog_id = d.id and owner.user_id = ?)'
    : 'where 1 = 1'
  const params: unknown[] = user.role === 'resident' ? [user.id] : []
  if (status !== null) params.push(status)
  const result = await rows<DogRow>(
    `select ${fields} ${joins} ${where} ${status !== null ? 'and d.status = ?' : ''} order by d.created_at desc, d.id desc`, params,
  )
  res.json(result.map(present))
})

router.get('/:id', requireUser, async (req, res) => {
  const id = positiveId(req.params.id)
  const user = res.locals.user as User
  const [dog] = await rows<DogRow>(
    `select ${fields} ${joins} where d.id = ? ${user.role === 'resident'
      ? 'and exists (select 1 from dog_owners owner where owner.dog_id = d.id and owner.user_id = ?)'
      : ''}`,
    user.role === 'resident' ? [id, user.id] : [id],
  )
  if (!dog) throw new HttpError(404, '犬只不存在')
  res.json(present(dog))
})

router.post('/', requireUser, requireResident, async (req, res) => {
  const dog = dogInput(body(req.body))
  const user = res.locals.user as User
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    const [result] = await connection.execute<import('mysql2/promise').ResultSetHeader>(
      `insert into dogs (name, breed, sex, age, vaccinated, last_vaccinated_on, contact_phone, license_number)
       values (?, ?, ?, ?, ?, ?, ?, ?)`,
      [dog.name, dog.breed, dog.sex, dog.age, dog.vaccine, dog.record, dog.phone, dog.number],
    )
    await connection.execute('insert into dog_owners (dog_id, user_id, is_primary) values (?, ?, 1)', [result.insertId, user.id])
    await connection.commit()
    res.status(201).json({ id: result.insertId, ...dog, status: 0, masterName: user.name })
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
})

router.put('/:id', requireUser, requireResident, async (req, res) => {
  const id = positiveId(req.params.id)
  const user = res.locals.user as User
  const [old] = await rows<DogRow>(
    `select ${fields} ${joins} where d.id = ? and exists
     (select 1 from dog_owners owner where owner.dog_id = d.id and owner.user_id = ?)`, [id, user.id],
  )
  if (!old) throw new HttpError(404, '犬只不存在')
  const dog = dogInput({ ...present(old), ...body(req.body) })
  await change(
    `update dogs set name = ?, breed = ?, sex = ?, age = ?, vaccinated = ?, last_vaccinated_on = ?,
     contact_phone = ?, license_number = ?, status = 0 where id = ?`,
    [dog.name, dog.breed, dog.sex, dog.age, dog.vaccine, dog.record, dog.phone, dog.number, id],
  )
  res.json({ id, ...dog, status: 0, masterName: old.masterName })
})

router.delete('/:id', requireUser, requireResident, async (req, res) => {
  const id = positiveId(req.params.id)
  const user = res.locals.user as User
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    const [dogs] = await connection.execute<RowDataPacket[]>(
      'select id, status from dogs where id = ? for update', [id],
    )
    if (!dogs.length || dogs[0].status !== 0) throw new HttpError(409, '犬只不存在或不能撤销')
    const [owners] = await connection.execute<RowDataPacket[]>(
      'select user_id, is_primary from dog_owners where dog_id = ? order by id for update', [id],
    )
    const current = owners.find((owner) => owner.user_id === user.id)
    if (!current) throw new HttpError(404, '犬只不存在')
    await connection.execute('delete from dog_owners where dog_id = ? and user_id = ?', [id, user.id])
    if (owners.length === 1) {
      await connection.execute('delete from dogs where id = ?', [id])
    } else {
      if (current.is_primary) {
        const replacement = owners.find((owner) => owner.user_id !== user.id)
        await connection.execute('update dog_owners set is_primary = 1 where dog_id = ? and user_id = ?',
          [id, replacement!.user_id])
      }
    }
    await connection.commit()
    res.status(204).end()
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
})

router.patch('/:id/review', requireUser, requireAdmin, async (req, res) => {
  const id = positiveId(req.params.id)
  const status = statusValue(body(req.body).status)
  const result = await change('update dogs set status = ? where id = ? and status = 0', [status, id])
  if (!result.affectedRows) throw new HttpError(409, '犬只不存在或已经审核')
  res.json({ id, status })
})

export default router
