import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { once } from 'node:events'
import { app } from '../src/server/index.ts'
import { hashPassword, verifyPassword } from '../src/server/auth.ts'

test('password hashing matches the existing MySQL seed format', async () => {
  const seed = readFileSync(new URL('../src/server/sql/crud.sql', import.meta.url), 'utf8')
  const existingHash = seed.match(/scrypt\$16384\$8\$1\$[a-f0-9]+\$[a-f0-9]+/)?.[0]
  assert.ok(existingHash)
  assert.equal(await verifyPassword('123456', existingHash), true)
  assert.equal(await verifyPassword('wrong-password', existingHash), false)
  const newHash = await hashPassword('another-password')
  assert.equal(await verifyPassword('another-password', newHash), true)
})

test('registration cannot create admin accounts and protected routes require a token', async () => {
  const server = app.listen(0)
  await once(server, 'listening')
  try {
    const address = server.address()
    assert.ok(address && typeof address !== 'string')
    const base = `http://127.0.0.1:${address.port}`
    const registration = await fetch(`${base}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ account: 'admin2', name: 'Admin', password: '123456', role: 'admin' }),
    })
    assert.equal(registration.status, 403)
    assert.equal((await fetch(`${base}/api/dogs`)).status, 401)
    assert.equal((await fetch(`${base}/api/complaints`)).status, 401)
    assert.equal((await fetch(`${base}/api/not-found`)).status, 404)
    const malformed = await fetch(`${base}/api/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{',
    })
    assert.equal(malformed.status, 400)
  } finally {
    server.close()
    await once(server, 'close')
  }
})
