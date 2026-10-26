import type { ScoreHistoryEntry, TopicMastery } from '../types/progress'
import { apiClient } from './client'

export const progressService = {
  async getTopicMastery(signal?: AbortSignal) {
    const { data } = await apiClient.get<TopicMastery[]>('/progreso/dominio-temas', { signal })
    return data
  },

  async getScoreHistory(areaId: number, signal?: AbortSignal) {
    const { data } = await apiClient.get<ScoreHistoryEntry[]>('/progreso/historial', {
      params: { areaId },
      signal,
    })
    return data
  },
}
