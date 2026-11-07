import type { Goal } from '../types/goal'

// La meta principal es la activa más antigua: el mismo criterio que usa el backend en la liga.
export function findMainGoal(goals: Goal[]) {
  return goals.reduce<Goal | null>(
    (oldest, goal) => (oldest === null || goal.id < oldest.id ? goal : oldest),
    null,
  )
}
