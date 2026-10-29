import type { ExamQuestion, ExamType } from '../types/exam'

export const examTypeLabels: Record<ExamType, string> = {
  DIAGNOSTICO: 'Simulacro diagnóstico',
  POR_TEMA: 'Simulacro por tema',
  COMPLETO: 'Simulacro completo',
}

export function formatScore(score: number | null) {
  return score === null ? '—' : score.toLocaleString('es-PE', { maximumFractionDigits: 2 })
}

export function formatExamDate(isoDateTime: string) {
  return new Date(isoDateTime).toLocaleDateString('es-PE', { dateStyle: 'medium' })
}

export function countAnswers(questions: ExamQuestion[]) {
  const correct = questions.filter((question) => question.esCorrecta).length
  const blank = questions.filter((question) => question.alternativaMarcada === null).length
  return { correct, blank, incorrect: questions.length - correct - blank }
}
