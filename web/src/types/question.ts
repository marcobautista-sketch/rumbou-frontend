import type { QuestionPresentation, SolutionStep } from './presentation'

export type Difficulty = 'FACIL' | 'MEDIA' | 'DIFICIL'

export interface Question {
  id: number
  temaId: number
  temaNombre: string
  enunciado: string
  alternativas: string[]
  dificultad: Difficulty
  presentacion: QuestionPresentation | null
}

export interface AdminQuestion extends Question {
  claveCorrecta: number
  explicacion: string | null
  aprobada: boolean
  pasos: SolutionStep[] | null
}

export function isAdminQuestion(question: Question): question is AdminQuestion {
  return 'claveCorrecta' in question
}

export interface QuestionRequest {
  temaId: number
  enunciado: string
  alternativas: string[]
  claveCorrecta: number
  explicacion: string | null
  dificultad: Difficulty
  aprobada: boolean
}

export interface QuestionFilters {
  temaId?: number
  dificultad?: Difficulty
  aprobada?: boolean
}

export interface QuestionQuery extends QuestionFilters {
  page: number
  size: number
  sort?: string
  texto?: string
}
