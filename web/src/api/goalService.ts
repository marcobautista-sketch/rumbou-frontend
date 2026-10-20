import { apiClient } from './client'

export const goalService = {
  async create(ofertaAcademicaId: number) {
    await apiClient.post('/objetivos', { ofertaAcademicaId })
  },
}
