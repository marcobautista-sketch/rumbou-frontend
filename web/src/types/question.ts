export type Difficulty = 'FACIL' | 'MEDIA' | 'DIFICIL'
export type QuestionOrigin = 'SEMILLA' | 'IA_APROBADA'

export interface Question {
  id: number
  temaId: number
  temaNombre: string
  enunciado: string
  alternativas: string[]
  dificultad: Difficulty
}

export interface AdminQuestion extends Question {
  claveCorrecta: number
  explicacion: string | null
  origen: QuestionOrigin
  aprobada: boolean
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
  origen: QuestionOrigin
  aprobada: boolean
}

export interface QuestionFilters {
  temaId?: number
  dificultad?: Difficulty
  origen?: QuestionOrigin
  aprobada?: boolean
}

export interface QuestionQuery extends QuestionFilters {
  page: number
  size: number
  sort?: string
  texto?: string
}

export interface TutorExplanation {
  preguntaId: number
  explicacion: string
}
