import { store } from './redux'

export function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = store.getState().global.token
  const headers = new Headers(options.headers)
  if (token) headers.set('Authorization', `Bearer ${token}`)
  return fetch(`${import.meta.env.VITE_API_BASE_URL || ''}${path}`, { ...options, headers })
}
