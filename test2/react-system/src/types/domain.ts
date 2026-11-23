import type { Dayjs } from 'dayjs'

export interface Dog {
  id: string
  name: string
  breed: string
  sex: string
  age: string
  vaccine: boolean
  status: number
  masterName: string
  record?: string | Dayjs
  phone?: string
  number?: string
}

export interface Complaint {
  id: string
  content: string
  time: string
  name?: string
  status: number
  title?: string
}
