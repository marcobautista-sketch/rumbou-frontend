export type ExamStatus = 'EN_CURSO' | 'FINALIZADO'

export interface ExamQuestion {
  respuestaUsuarioId: number
  preguntaId: number
  temaId: number
  tema: string
  enunciado: string
  alternativas: string[]
  alternativaMarcada: number | null
  claveCorrecta: number | null
  esCorrecta: boolean | null
  explicacion: string | null
}

export interface ExamDetail {
  id: number
  estado: ExamStatus
  fechaFin: string | null
  puntajeObtenido: number | null
  psp: number | null
  preguntas: ExamQuestion[]
}

export interface ExamSummary {
  id: number
  estado: ExamStatus
  area: string
  fechaFin: string | null
}
