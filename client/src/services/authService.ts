import api from './api'
import type { AuthResponse, LoginDTO, RegisterDTO } from '@/types/dto'

export async function loginApi(credentials: LoginDTO): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/login', credentials)
  return data
}

export async function registerApi(payload: RegisterDTO): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/register', payload)
  return data
}

/**
 * Exchange a Google credential (ID token from @react-oauth/google) for an app JWT.
 */
export async function googleLoginApi(credential: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/google', { credential })
  return data
}
