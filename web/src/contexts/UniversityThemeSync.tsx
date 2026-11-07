import { useEffect } from 'react'
import { goalService, onGoalsChanged } from '../api/goalService'
import { useAuth } from '../hooks/useAuth'
import { applyUniversity, findMainGoal } from '../utils/universityTheme'

// La universidad de la meta principal define los acentos de la web. Sin sesión o sin meta se
// queda la paleta Cuaderno.
export function UniversityThemeSync() {
  const { user, status } = useAuth()
  const userId = user?.id ?? null

  useEffect(() => {
    if (status === 'anonymous') {
      applyUniversity(null)
      return
    }
    if (userId === null) return
    const controller = new AbortController()
    let latestRequest = 0

    const load = () => {
      latestRequest += 1
      const request = latestRequest
      return goalService.list(controller.signal).then(
        (goals) => {
          // Una respuesta vieja no debe pisar la de la última meta agregada o quitada.
          if (request === latestRequest) applyUniversity(findMainGoal(goals)?.universidad ?? null)
        },
        () => {
          // Sin conexión se conservan los colores que ya tenía.
        },
      )
    }

    void load()
    const unsubscribe = onGoalsChanged(load)
    return () => {
      controller.abort()
      unsubscribe()
    }
  }, [status, userId])

  return null
}
