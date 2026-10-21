import type { SolutionPhoto, SolutionReview } from '../types/solution'
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

  async reviewSolution(questionId: number, photo: SolutionPhoto) {
    // React Native sube el archivo desde su uri y arma el multipart (con su boundary) por su cuenta.
    // El backend espera la foto en la parte "imagen".
    const form = new FormData()
    form.append('imagen', photo as unknown as Blob)
    const { data } = await apiClient.post<SolutionReview>(
      `/preguntas/${questionId}/revisar-solucion`,
      form,
      { timeout: 60000 },
    )
    return data
  },
}
