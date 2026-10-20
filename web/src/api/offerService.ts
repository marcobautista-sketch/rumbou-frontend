import type { AcademicOffer } from '../types/offer'
import { apiClient } from './client'

export interface OfferFilters {
  universidad?: string
  area?: string
  carrera?: string
}

export const offerService = {
  async search(filters: OfferFilters, signal?: AbortSignal) {
    const { data } = await apiClient.get<AcademicOffer[]>('/ofertas-academicas', {
      params: filters,
      signal,
    })
    return data
  },
}
