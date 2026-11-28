import { store } from './redux'

export function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = store.getState().global.token
  const headers = new Headers(options.headers)
  if (token) headers.set('Authorization', `Bearer ${token}`)
  return fetch(`${import.meta.env.VITE_API_BASE_URL || ''}${path}`, { ...options, headers })
}

export async function apiJson<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await apiFetch(path, options)
  const text = await response.text()
  let data: unknown
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    if (response.ok) throw new Error('响应数据格式错误')
    throw new Error(`请求失败（${response.status}）`)
  }
  if (!response.ok) {
    const message = typeof data === 'object' && data !== null && 'message' in data && typeof data.message === 'string' && data.message.trim()
      ? data.message
      : `请求失败（${response.status}）`
    throw new Error(message)
  }
  if (data === null) throw new Error('响应数据为空')
  return data as T
}
