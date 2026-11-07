import type { Goal } from '../types/goal'
import { apiClient } from './client'

const goalListeners = new Set<() => void>()

// Avisa cuando cambian las metas, porque de la principal dependen los colores de la web.
export function onGoalsChanged(listener: () => void) {
  goalListeners.add(listener)
  return () => {
    goalListeners.delete(listener)
  }
}

const notifyGoalsChanged = () => goalListeners.forEach((listener) => listener())

export const goalService = {
  async list(signal?: AbortSignal) {
    const { data } = await apiClient.get<Goal[]>('/objetivos', { signal })
    return data
  },

  async create(ofertaAcademicaId: number) {
    const { data } = await apiClient.post<Goal>('/objetivos', { ofertaAcademicaId })
    notifyGoalsChanged()
    return data
  },

  async remove(goalId: number) {
    await apiClient.delete(`/objetivos/${goalId}`)
    notifyGoalsChanged()
  },
}
