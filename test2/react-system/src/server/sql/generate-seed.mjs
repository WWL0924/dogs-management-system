import { readFileSync, writeFileSync } from 'node:fs'
import { randomBytes, scryptSync } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { resolve, dirname } from 'node:path'

const directory = dirname(fileURLToPath(import.meta.url))
const source = JSON.parse(readFileSync(resolve(directory, '../../../db.json'), 'utf8'))
const destination = resolve(directory, 'seed.sql')
const issues = []
const statements = [
  '-- 由 generate-seed.mjs 从 db.json 生成；仅在空的 dog_system 表中执行一次。',
  '-- 旧数据有重复和缺失项，未导入项仍保留在 db.json，详情见 seed-report.json。',
  '-- password_hash 使用 node:crypto 的 scrypt；后续登录接口须使用同一算法校验。',
  'use dog_system;',
  'start transaction;'
]

function literal(value) {
  if (value == null) return 'null'
  return `convert(0x${Buffer.from(String(value), 'utf8').toString('hex')} using utf8mb4)`
}

function passwordHash(password) {
  const salt = randomBytes(16)
  const hash = scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 })
  return `scrypt$16384$8$1$${salt.toString('hex')}$${hash.toString('hex')}`
}

function localDate(value) {
  if (!value) return null
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) throw new Error(`invalid date: ${value}`)
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(date)
  const fields = Object.fromEntries(parts.map(({ type, value: part }) => [type, part]))
  return `${fields.year}-${fields.month}-${fields.day}`
}

function localDateTime(value) {
  const date = localDate(value)
  return date ? `${date} 00:00:00` : null
}

const accounts = new Map()
const usersByName = new Map()
for (const [role, records] of [['resident', source.resident], ['admin', source.admin]]) {
  for (const [index, user] of records.entries()) {
    if (accounts.has(user.account)) {
      issues.push({ collection: role, index, id: user.id, reason: `账号 ${user.account} 重复，未导入` })
      continue
    }
    accounts.set(user.account, user)
    usersByName.set(user.name, user)
    statements.push(
      `insert into users (account, password_hash, name, role) values (${literal(user.account)}, ${literal(passwordHash(user.password))}, ${literal(user.name)}, ${literal(role)});`
    )
  }
}

const lastDogIndex = new Map(source.dogs.map((dog, index) => [dog.id, index]))
const licenseNumbers = new Set()
let importedDogs = 0
for (const [index, dog] of source.dogs.entries()) {
  if (lastDogIndex.get(dog.id) !== index) {
    issues.push({ collection: 'dogs', index, id: dog.id, reason: '犬只 id 重复，采用最后一条记录' })
    continue
  }
  const owner = usersByName.get(dog.masterName)
  if (!owner || !source.resident.some(user => user.account === owner.account)) {
    issues.push({ collection: 'dogs', index, id: dog.id, reason: '找不到对应的居民主人，未导入' })
    continue
  }
  let licenseNumber = dog.number || null
  if (licenseNumber && licenseNumbers.has(licenseNumber)) {
    issues.push({ collection: 'dogs', index, id: dog.id, reason: `犬证编号 ${licenseNumber} 重复，导入时置空` })
    licenseNumber = null
  }
  if (licenseNumber) licenseNumbers.add(licenseNumber)
  const vaccinationDate = dog.vaccine ? localDate(dog.record) : null
  if (!dog.vaccine && dog.record) {
    issues.push({ collection: 'dogs', index, id: dog.id, reason: '未接种却有接种日期，导入时清空日期' })
  }
  statements.push(
    `insert into dogs (name, breed, sex, age, vaccinated, last_vaccinated_on, contact_phone, license_number, status) values (${literal(dog.name)}, ${literal(dog.breed)}, ${literal(dog.sex)}, ${Number(dog.age)}, ${dog.vaccine ? 1 : 0}, ${literal(vaccinationDate)}, ${literal(dog.phone)}, ${literal(licenseNumber)}, ${dog.status});`,
    `insert into dog_owners (dog_id, user_id, is_primary) values (last_insert_id(), (select id from users where account = ${literal(owner.account)}), true);`
  )
  importedDogs++
}

let importedComplaints = 0
for (const [index, complaint] of source.complain.entries()) {
  const reporter = usersByName.get(complaint.name)
  if (!reporter) {
    issues.push({ collection: 'complain', index, id: complaint.id, reason: '缺少投诉人，未导入' })
    continue
  }
  if (complaint.status !== 0) {
    issues.push({ collection: 'complain', index, id: complaint.id, reason: '已处理记录缺少处理人和处理结果，未导入' })
    continue
  }
  // 旧数据没有标题，用原投诉内容填充必填标题。
  statements.push(
    `insert into complaints (reporter_id, title, content, created_at) values ((select id from users where account = ${literal(reporter.account)}), ${literal(complaint.title || complaint.content.slice(0, 100))}, ${literal(complaint.content)}, ${literal(localDateTime(complaint.time))});`
  )
  importedComplaints++
}

statements.push('commit;', '')
writeFileSync(destination, statements.join('\n'), 'utf8')
writeFileSync(resolve(directory, 'seed-report.json'), JSON.stringify({
  source: { users: source.resident.length + source.admin.length, dogs: source.dogs.length, complaints: source.complain.length },
  imported: { users: accounts.size, dogs: importedDogs, complaints: importedComplaints },
  issues
}, null, 2) + '\n', 'utf8')
console.log(`Generated seed.sql: ${accounts.size} users, ${importedDogs} dogs, ${importedComplaints} complaints; ${issues.length} source issues.`)
