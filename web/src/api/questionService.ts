import type { Page } from '../types/page'
import type {
  AdminQuestion,
  Question,
  QuestionQuery,
  QuestionRequest,
  TutorExplanation,
} from '../types/question'
import { apiClient } from './client'

const TUTOR_TIMEOUT_MS = 60000

export const questionService = {
  async list(query: QuestionQuery, signal?: AbortSignal) {
    const { data } = await apiClient.get<Page<Question>>('/preguntas', { params: query, signal })
    return data
  },

  async getById(questionId: number, signal?: AbortSignal) {
    const { data } = await apiClient.get<Question>(`/preguntas/${questionId}`, { signal })
    return data
  },

  async create(request: QuestionRequest) {
    const { data } = await apiClient.post<AdminQuestion>('/preguntas', request)
    return data
  },

  async update(questionId: number, request: QuestionRequest) {
    const { data } = await apiClient.put<AdminQuestion>(`/preguntas/${questionId}`, request)
    return data
  },

  async remove(questionId: number) {
    await apiClient.delete(`/preguntas/${questionId}`)
  },

  async approve(questionId: number) {
    const { data } = await apiClient.patch<AdminQuestion>(`/preguntas/${questionId}/aprobar`)
    return data
  },

  async approveBatch(ids: number[]) {
    const { data } = await apiClient.patch<AdminQuestion[]>('/preguntas/aprobar-lote', { ids })
    return data
  },

  async askTutor(questionId: number, markedAlternative?: number | null) {
    const { data } = await apiClient.post<TutorExplanation>(
      `/preguntas/${questionId}/tutor-ia`,
      markedAlternative == null ? undefined : { alternativaMarcada: markedAlternative },
      { timeout: TUTOR_TIMEOUT_MS },
    )
    return data
  },
}
