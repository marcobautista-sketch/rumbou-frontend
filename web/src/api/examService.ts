import type { ExamDetail, StartExamRequest } from '../types/exam'
import { apiClient } from './client'

export const examService = {
  async start(request: StartExamRequest) {
    const { data } = await apiClient.post<{ id: number }>('/simulacros', request)
    return data.id
  },

  async getDetail(examId: number, signal?: AbortSignal) {
    const { data } = await apiClient.get<ExamDetail>(`/simulacros/${examId}`, { signal })
    return data
  },

  async answer(examId: number, preguntaId: number, alternativaMarcada: number | null) {
    await apiClient.post(`/simulacros/${examId}/respuestas`, { preguntaId, alternativaMarcada })
  },

  async finish(examId: number) {
    await apiClient.post(`/simulacros/${examId}/finalizar`)
  },
}
