export class HttpError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export function body(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new HttpError(400, '请求体必须是对象')
  return value as Record<string, unknown>
}

export function requiredText(value: unknown, label: string, max: number): string {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > max) {
    throw new HttpError(400, `${label}不能为空且不能超过${max}字`)
  }
  return value.trim()
}

export function optionalText(value: unknown, label: string, max: number): string | null {
  if (value == null || value === '') return null
  return requiredText(value, label, max)
}

export function positiveId(value: unknown): number {
  const id = Number(value)
  if (!Number.isSafeInteger(id) || id < 1) throw new HttpError(400, '无效的ID')
  return id
}

export function statusValue(value: unknown): 1 | 2 {
  if (value !== 1 && value !== 2) throw new HttpError(400, '状态只能是1或2')
  return value
}
