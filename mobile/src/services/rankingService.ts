import type { League } from '../types/league'
import { apiClient } from './client'

export const rankingService = {
  async get(page: number, size: number, signal?: AbortSignal) {
    const { data } = await apiClient.get<League>('/ranking', { params: { page, size }, signal })
    return data
  },

  async join(alias: string) {
    const { data } = await apiClient.put<League>('/ranking/participacion', { alias })
    return data
  },

  async leave() {
    await apiClient.delete('/ranking/participacion')
  },
}
