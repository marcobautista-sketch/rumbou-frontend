import type { SolutionReview } from '../types/solution'
import { apiClient } from './client'

export const solutionService = {
  // El navegador arma el multipart con su boundary; el backend espera la imagen en la parte "imagen".
  async review(questionId: number, image: Blob, fileName: string) {
    const form = new FormData()
    form.append('imagen', image, fileName)
    const { data } = await apiClient.post<SolutionReview>(
      `/preguntas/${questionId}/revisar-solucion`,
      form,
      { timeout: 60000 },
    )
    return data
  },
}
