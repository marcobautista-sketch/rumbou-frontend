export type SolutionVerdict = 'CORRECTA' | 'PARCIAL' | 'INCORRECTA' | 'ILEGIBLE'

export interface SolutionReview {
  preguntaId: number
  veredicto: SolutionVerdict
  retroalimentacion: string
}

export interface SolutionPhoto {
  uri: string
  name: string
  type: string
}
