import type { QuestionPresentation, SolutionStep } from './presentation'

export interface DailyChallenge {
  fecha: string
  preguntaId: number
  temaId: number
  tema: string
  enunciado: string
  alternativas: string[]
  respondido: boolean
  alternativaMarcada: number | null
  esCorrecta: boolean | null
  claveCorrecta: number | null
  explicacion: string | null
  xpGanado: number | null
  xpPorAcierto: number
  desafiosDeLaSemana: number
  metaSemanal: number
  presentacion: QuestionPresentation | null
  // Como la explicación: llega recién después de responder.
  pasos: SolutionStep[] | null
}
