import type { AuthTokens, LoginRequest, RegisterRequest } from '../types/auth'
import { apiClient, refreshTokens } from './client'
import { tokenStorage } from './tokenStorage'

async function startSession(path: string, body: LoginRequest | RegisterRequest) {
  const { data } = await apiClient.post<AuthTokens>(path, body)
  await tokenStorage.save(data)
}

export const authService = {
  login: (credentials: LoginRequest) => startSession('/auth/login', credentials),

  register: (account: RegisterRequest) => startSession('/auth/register', account),

  restoreSession: () => refreshTokens(),

  logout: () => tokenStorage.clear(),

  async forgotPassword(email: string) {
    await apiClient.post('/auth/forgot-password', { email })
  },
}
