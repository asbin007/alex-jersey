import Cookies from 'js-cookie'
import type { AuthUser } from '@/types'

const TOKEN_KEY = 'admin_token'
const USER_KEY = 'admin_user'

export function getToken(): string | undefined {
  return Cookies.get(TOKEN_KEY)
}

export function getStoredUser(): AuthUser | null {
  const raw = Cookies.get(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

export function setAuth(token: string, user: AuthUser) {
  Cookies.set(TOKEN_KEY, token, { expires: 1 })
  Cookies.set(USER_KEY, JSON.stringify(user), { expires: 1 })
}

export function clearAuth() {
  Cookies.remove(TOKEN_KEY)
  Cookies.remove(USER_KEY)
}

export function isAdminUser(user: AuthUser | null): boolean {
  return user?.role === 'admin'
}
