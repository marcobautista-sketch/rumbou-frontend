import type { Goal } from '../types/goal'
import type { AcademicOffer } from '../types/offer'
import { apiClient } from './client'

export const goalService = {
  async listOffers(signal?: AbortSignal) {
    const { data } = await apiClient.get<AcademicOffer[]>('/ofertas-academicas', { signal })
    return data
  },

  async list(signal?: AbortSignal) {
    const { data } = await apiClient.get<Goal[]>('/objetivos', { signal })
    return data
  },

  async create(ofertaAcademicaId: number) {
    await apiClient.post('/objetivos', { ofertaAcademicaId })
  },

  // El backend no borra la meta: la desactiva y conserva su historial.
  async remove(goalId: number) {
    await apiClient.delete(`/objetivos/${goalId}`)
  },
}
