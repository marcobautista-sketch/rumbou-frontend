export type SolutionVerdict = 'CORRECTA' | 'PARCIAL' | 'INCORRECTA' | 'ILEGIBLE'

export interface SolutionReview {
  preguntaId: number
  veredicto: SolutionVerdict
  retroalimentacion: string
}
