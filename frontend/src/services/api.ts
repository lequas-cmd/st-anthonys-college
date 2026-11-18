const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

const getStoredToken = (): string | null =>
  (typeof localStorage !== 'undefined' && localStorage.getItem('collegeAuthToken')) ??
  (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('collegeSessionToken')) ??
  null

/** Typed fetch wrapper for requests to the college backend API. */
export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken()
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  })

  const payload = await response.json().catch(() => null) as { message?: string } | null
  if (!response.ok) {
    throw new Error(payload?.message ?? `Request failed (${response.status})`)
  }
  return payload as T
}
