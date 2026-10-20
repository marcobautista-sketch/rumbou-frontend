import type { Area, Topic } from '../types/exam'
import { apiClient } from './client'

export const areaService = {
  async list(signal?: AbortSignal) {
    const { data } = await apiClient.get<Area[]>('/areas', { signal })
    return data
  },

  async listTopics(areaId: number, signal?: AbortSignal) {
    const { data } = await apiClient.get<Topic[]>(`/areas/${areaId}/temas`, { signal })
    return data
  },
}
