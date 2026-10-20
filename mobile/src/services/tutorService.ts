import { apiClient } from './client'

export const tutorService = {
  async explain(questionId: number, markedAlternative: number | null) {
    const { data } = await apiClient.post<{ explicacion: string }>(
      `/preguntas/${questionId}/tutor-ia`,
      markedAlternative == null ? undefined : { alternativaMarcada: markedAlternative },
      { timeout: 60000 },
    )
    return data.explicacion
  },
}
