import type { BadgeTone } from '../components/ui/Badge'
import type { Difficulty, QuestionOrigin } from '../types/question'

export const difficulties: Difficulty[] = ['FACIL', 'MEDIA', 'DIFICIL']
export const origins: QuestionOrigin[] = ['SEMILLA', 'IA_APROBADA']

export const difficultyLabels: Record<Difficulty, string> = {
  FACIL: 'Fácil',
  MEDIA: 'Media',
  DIFICIL: 'Difícil',
}

export const difficultyTones: Record<Difficulty, BadgeTone> = {
  FACIL: 'success',
  MEDIA: 'warning',
  DIFICIL: 'danger',
}

export const originLabels: Record<QuestionOrigin, string> = {
  SEMILLA: 'Banco base',
  IA_APROBADA: 'Generada con IA',
}

export const questionSortOptions = [
  { value: 'id,desc', label: 'Más recientes' },
  { value: 'id,asc', label: 'Más antiguas' },
  { value: 'tema.nombre,asc', label: 'Tema (A–Z)' },
  { value: 'enunciado,asc', label: 'Enunciado (A–Z)' },
] as const

export const DEFAULT_QUESTION_SORT = 'id,desc'

export function isDifficulty(value: string | null): value is Difficulty {
  return difficulties.some((difficulty) => difficulty === value)
}
