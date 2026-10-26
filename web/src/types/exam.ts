export type ExamType = 'DIAGNOSTICO' | 'POR_TEMA' | 'COMPLETO'
export type ExamStatus = 'EN_CURSO' | 'FINALIZADO'

export interface Area {
  id: number
  universidad: string
  codigo: string
  nombre: string
  procesoProximo: string | null
  fechaProximoExamen: string | null
  fechaExamenConfirmada: boolean | null
}

export interface Topic {
  id: number
  nombre: string
}

export interface TopicDetail extends Topic {
  cantidadPreguntas: number
  subtemas: string[]
}

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
  puntajeAportado: number | null
  explicacion: string | null
}

export interface ExamDetail {
  id: number
  tipo: ExamType
  estado: ExamStatus
  areaId: number
  fechaInicio: string
  fechaFin: string | null
  puntajeObtenido: number | null
  psp: number | null
  preguntas: ExamQuestion[]
}

export interface StartExamRequest {
  areaId: number
  tipo: ExamType
  temaId?: number
}
