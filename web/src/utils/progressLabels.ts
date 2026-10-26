import type { BadgeTone } from '../components/ui/Badge'
import type { PreparationStatus } from '../types/goal'

export const preparationTones: Record<PreparationStatus, BadgeTone> = {
  HOLGADO: 'success',
  AJUSTADO: 'brand',
  CERCA: 'warning',
  REFORZAR: 'danger',
}

export interface Rank {
  name: string
  minXp: number
}

export const ranks: Rank[] = [
  { name: 'Novato', minXp: 0 },
  { name: 'Aplicado', minXp: 500 },
  { name: 'Avanzado', minXp: 1500 },
  { name: 'Experto', minXp: 3000 },
]

export function rankFor(xp: number) {
  const index = Math.max(
    0,
    ranks.findLastIndex((rank) => xp >= rank.minXp),
  )
  return { current: ranks[index], next: ranks[index + 1] ?? null }
}

export type MasteryTone = Extract<BadgeTone, 'success' | 'warning' | 'danger'>

export function masteryTone(percentage: number): MasteryTone {
  if (percentage >= 70) return 'success'
  if (percentage >= 40) return 'warning'
  return 'danger'
}
