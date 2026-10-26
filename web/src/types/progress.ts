import type { ExamType } from './exam'

export interface TopicMastery {
  temaId: number
  tema: string
  correctas: number
  incorrectas: number
  enBlanco: number
  total: number
  porcentajeAciertos: number
}

export interface ScoreHistoryEntry {
  simulacroId: number
  tipo: ExamType
  fechaFin: string
  puntajeObtenido: number
  psp: number
}
