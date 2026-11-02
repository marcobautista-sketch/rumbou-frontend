import type { Figure } from '../utils/figure'

// Versión con formato de una pregunta: LaTeX entre $...$ y una figura opcional. Cada campo
// null significa "usar el texto plano".
export interface QuestionPresentation {
  enunciado: string | null
  alternativas: string[] | null
  figura: Figure | null
}

// Un paso de la resolución; la primera fila de la tabla es el encabezado.
export interface SolutionStep {
  titulo: string
  detalle: string
  tabla: string[][] | null
}
