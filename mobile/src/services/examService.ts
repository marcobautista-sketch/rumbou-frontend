import type { ExamDetail, ExamSummary, StartExamRequest } from '../types/exam'
import type { Page } from '../types/page'
import { apiClient } from './client'

export const examService = {
  async start(request: StartExamRequest) {
    const { data } = await apiClient.post<{ id: number }>('/simulacros', request)
    return data.id
  },

  // El backend los lista del más reciente al más antiguo.
  async list(page: number, size: number, signal?: AbortSignal) {
    const { data } = await apiClient.get<Page<ExamSummary>>('/simulacros', {
      params: { page, size },
      signal,
    })
    return data
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

  async latestFinished(signal?: AbortSignal) {
    const { content } = await examService.list(0, 20, signal)
    return content.find((exam) => exam.estado === 'FINALIZADO') ?? null
  },
}
