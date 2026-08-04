import { apiClient } from '@/lib/api/client'

export interface AuthUser {
  sub: string
  email: string
  role: string
  teamId: string | null
  emailVerified: boolean
}

export interface SignupPayload {
  email: string
  password: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface ConfirmPasswordResetPayload {
  token: string
  newPassword: string
}

export async function signup(payload: SignupPayload) {
  const { data } = await apiClient.post<{ user: AuthUser }>('/auth/signup', payload)
  return data.user
}

export async function login(payload: LoginPayload) {
  const { data } = await apiClient.post<{ user: AuthUser }>('/auth/login', payload)
  return data.user
}

export async function logout() {
  await apiClient.post('/auth/logout')
}

export async function fetchCurrentUser() {
  const { data } = await apiClient.get<{ user: AuthUser }>('/auth/me')
  return data.user
}

export async function verifyEmail(token: string) {
  await apiClient.post('/auth/verify-email', { token })
}

export async function resendVerification(email: string) {
  await apiClient.post('/auth/resend-verification', { email })
}

export async function requestPasswordReset(email: string) {
  await apiClient.post('/auth/password-reset/request', { email })
}

export async function confirmPasswordReset(payload: ConfirmPasswordResetPayload) {
  await apiClient.post('/auth/password-reset/confirm', payload)
}

export function googleAuthUrl() {
  return `${apiClient.defaults.baseURL}/auth/google`
}
