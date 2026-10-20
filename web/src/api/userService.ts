import type { Role, User } from '../types/auth'
import type { Gamification } from '../types/gamification'
import { apiClient } from './client'

export const userService = {
  async getMe(signal?: AbortSignal) {
    const { data } = await apiClient.get<User>('/usuarios/me', { signal })
    return data
  },

  async getGamification(signal?: AbortSignal) {
    const { data } = await apiClient.get<Gamification>('/usuarios/me/gamificacion', { signal })
    return data
  },

  async findByEmail(email: string, signal?: AbortSignal) {
    const { data } = await apiClient.get<User>('/usuarios', { params: { email }, signal })
    return data
  },

  async changeRole(userId: number, role: Role) {
    const { data } = await apiClient.patch<User>(`/usuarios/${userId}/rol`, { role })
    return data
  },
}
