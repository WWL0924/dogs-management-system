import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto'
import type { RequestHandler } from 'express'
import { SignJWT, jwtVerify } from 'jose'
import type { RowDataPacket } from 'mysql2/promise'
import { rows } from './db.ts'
import { HttpError } from './http.ts'

function derive(password: string, salt: Buffer, length: number, n: number, r: number, p: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, length, { N: n, r, p, maxmem: 64 * 1024 * 1024 }, (error, key) => {
      if (error) reject(error)
      else resolve(key)
    })
  })
}
const secret = process.env.JWT_SECRET
  ? Buffer.from(process.env.JWT_SECRET)
  : randomBytes(32) //没有配置就临时生成

if (!process.env.JWT_SECRET) console.warn('JWT_SECRET 未配置：重启服务后已有登录会失效')
if (process.env.JWT_SECRET && secret.length < 32) throw new Error('JWT_SECRET 至少需要32字节')

export interface User extends RowDataPacket {
  id: number
  account: string
  name: string
  role: 'resident' | 'admin'
  password_hash?: string
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16)
  const key = await derive(password, salt, 64, 16384, 8, 1)
  return `scrypt$16384$8$1$${salt.toString('hex')}$${key.toString('hex')}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, n, r, p, salt, hash] = stored.split('$')
  if (scheme !== 'scrypt' || !salt || !hash || !Number.isSafeInteger(Number(n)) || Number(n) > 32768) return false
  try {
    const expected = Buffer.from(hash, 'hex')
    const actual = await derive(password, Buffer.from(salt, 'hex'), expected.length, Number(n), Number(r), Number(p))
    return expected.length > 0 && timingSafeEqual(actual, expected)
  } catch {
    return false
  }
}

export async function issueToken(user: User): Promise<string> {
  return new SignJWT({ role: user.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(String(user.id))
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
}

export const requireUser: RequestHandler = async (req, res, next) => {
  try {
    const token = /^Bearer (.+)$/i.exec(req.header('authorization') || '')?.[1]
    if (!token) throw new HttpError(401, '请先登录')
    const { payload } = await jwtVerify(token, secret, { algorithms: ['HS256'] })
    const id = Number(payload.sub)
    if (!Number.isSafeInteger(id)) throw new HttpError(401, '登录已失效')
    const [user] = await rows<User>('select id, account, name, role from users where id = ?', [id])
    if (!user) throw new HttpError(401, '登录已失效')
    res.locals.user = user
    next()
  } catch (error) {
    next(error instanceof HttpError ? error : new HttpError(401, '登录已失效'))
  }
}

export const requireAdmin: RequestHandler = (_req, res, next) => {
  next((res.locals.user as User)?.role === 'admin' ? undefined : new HttpError(403, '需要管理员权限'))
}

export const requireResident: RequestHandler = (_req, res, next) => {
  next((res.locals.user as User)?.role === 'resident' ? undefined : new HttpError(403, '需要居民权限'))
}
