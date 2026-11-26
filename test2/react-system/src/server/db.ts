import { config } from 'dotenv'
import { fileURLToPath } from 'node:url'
import mysql, { type ResultSetHeader, type RowDataPacket } from 'mysql2/promise'

config({ path: fileURLToPath(new URL('./.env', import.meta.url)) })

export const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'dog_system',
  waitForConnections: true,
  connectionLimit: 10,
  dateStrings: true,
  decimalNumbers: true,
})

export async function rows<T extends RowDataPacket>(sql: string, params: unknown[] = []): Promise<T[]> {
  const [result] = await pool.execute<T[]>(sql, params as (string | number | boolean | Date | null)[])
  return result
}

export async function change(sql: string, params: unknown[] = []): Promise<ResultSetHeader> {
  const [result] = await pool.execute<ResultSetHeader>(sql, params as (string | number | boolean | Date | null)[])
  return result
}
