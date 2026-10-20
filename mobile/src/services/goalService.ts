import type { AcademicOffer } from '../types/offer'
import { apiClient } from './client'

export const goalService = {
  async listOffers(signal?: AbortSignal) {
    const { data } = await apiClient.get<AcademicOffer[]>('/ofertas-academicas', { signal })
    return data
  },

  async create(ofertaAcademicaId: number) {
    await apiClient.post('/objetivos', { ofertaAcademicaId })
  },
}
