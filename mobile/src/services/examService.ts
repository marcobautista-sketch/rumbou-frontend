import type { ExamDetail, ExamSummary } from '../types/exam'
import type { Page } from '../types/page'
import { apiClient } from './client'

export const examService = {
  async getDetail(examId: number, signal?: AbortSignal) {
    const { data } = await apiClient.get<ExamDetail>(`/simulacros/${examId}`, { signal })
    return data
  },

  // El backend los lista del más reciente al más antiguo.
  async latestFinished(signal?: AbortSignal) {
    const { data } = await apiClient.get<Page<ExamSummary>>('/simulacros', {
      params: { size: 20 },
      signal,
    })
    return data.content.find((exam) => exam.estado === 'FINALIZADO') ?? null
  },
}
