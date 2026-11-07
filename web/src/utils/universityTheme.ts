import type { Goal } from '../types/goal'

const STORAGE_KEY = 'rumbou-university'
const themedUniversities = ['UNI', 'UNMSM']

// La meta principal es la activa más antigua: el mismo criterio que usa el backend en la liga.
export function findMainGoal(goals: Goal[]) {
  return goals.reduce<Goal | null>(
    (oldest, goal) => (oldest === null || goal.id < oldest.id ? goal : oldest),
    null,
  )
}

// Cambia los acentos de la web: index.css define los colores de cada data-university.
export function applyUniversity(siglas: string | null) {
  const university = siglas && themedUniversities.includes(siglas) ? siglas : null
  if (university) document.documentElement.dataset.university = university
  else delete document.documentElement.dataset.university
  try {
    if (university) localStorage.setItem(STORAGE_KEY, university)
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Sin acceso al storage los colores igual se aplican en esta visita.
  }
}

// Antes del primer pintado, para que al recargar no parpadee el azul de Cuaderno.
export function restoreUniversity() {
  try {
    applyUniversity(localStorage.getItem(STORAGE_KEY))
  } catch {
    // Sin acceso al storage se queda Cuaderno hasta que carguen las metas.
  }
}
