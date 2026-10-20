import type { AuthTokens, LoginRequest, RegisterRequest, ResetPasswordRequest } from '../types/auth'
import { apiClient, refreshAccessToken } from './client'
import { tokenStore } from './tokenStore'

async function startSession(path: string, body: LoginRequest | RegisterRequest) {
  const { data } = await apiClient.post<AuthTokens>(path, body)
  tokenStore.set(data.accessToken)
}

export const authService = {
  login: (credentials: LoginRequest) => startSession('/auth/login', credentials),

  register: (account: RegisterRequest) => startSession('/auth/register', account),

  restoreSession: () => refreshAccessToken(),

  async logout() {
    tokenStore.set(null)
    await apiClient.post('/auth/logout').catch(() => undefined)
  },

  async forgotPassword(email: string) {
    await apiClient.post('/auth/forgot-password', { email })
  },

  async resetPassword(request: ResetPasswordRequest) {
    await apiClient.post('/auth/reset-password', request)
  },
}
