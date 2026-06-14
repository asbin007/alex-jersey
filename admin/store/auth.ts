import Cookies from 'js-cookie'
import type { AuthUser } from '@/types'

const TOKEN_KEY = 'admin_token'
const USER_KEY = 'admin_user'

const DELIVERY_TOKEN_KEY = 'delivery_token'
const DELIVERY_USER_KEY = 'delivery_user'

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

// ── Delivery-specific auth (separate cookies so admin session never interferes) ──

export function getDeliveryToken(): string | undefined {
  return Cookies.get(DELIVERY_TOKEN_KEY)
}

export function getDeliveryUser(): AuthUser | null {
  const raw = Cookies.get(DELIVERY_USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

export function setDeliveryAuth(token: string, user: AuthUser) {
  Cookies.set(DELIVERY_TOKEN_KEY, token, { expires: 1 })
  Cookies.set(DELIVERY_USER_KEY, JSON.stringify(user), { expires: 1 })
}

export function clearDeliveryAuth() {
  Cookies.remove(DELIVERY_TOKEN_KEY)
  Cookies.remove(DELIVERY_USER_KEY)
}
