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

  async changePassword(currentPassword: string, newPassword: string) {
    await apiClient.patch('/usuarios/me/contrasena', {
      contrasenaActual: currentPassword,
      contrasenaNueva: newPassword,
    })
  },

  async updateProfile(profile: Pick<User, 'nombre' | 'apellidos' | 'telefono'>) {
    const { data } = await apiClient.put<User>('/usuarios/me', profile)
    return data
  },
}
