import type { Goal } from '../types/goal'
import { apiClient } from './client'

export const goalService = {
  async list(signal?: AbortSignal) {
    const { data } = await apiClient.get<Goal[]>('/objetivos', { signal })
    return data
  },

  async create(ofertaAcademicaId: number) {
    const { data } = await apiClient.post<Goal>('/objetivos', { ofertaAcademicaId })
    return data
  },

  async remove(goalId: number) {
    await apiClient.delete(`/objetivos/${goalId}`)
  },
}
