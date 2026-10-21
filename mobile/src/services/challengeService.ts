import type { DailyChallenge } from '../types/challenge'
import { apiClient } from './client'

export const challengeService = {
  async getToday(signal?: AbortSignal) {
    const { data } = await apiClient.get<DailyChallenge>('/desafios/hoy', { signal })
    return data
  },

  async answer(alternativaMarcada: number) {
    const { data } = await apiClient.post<DailyChallenge>('/desafios/hoy/respuesta', {
      alternativaMarcada,
    })
    return data
  },
}
