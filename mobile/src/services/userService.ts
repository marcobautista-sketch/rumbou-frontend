import type { User } from '../types/auth'
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
}
