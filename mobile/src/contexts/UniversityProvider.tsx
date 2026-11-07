import { useEffect, useState, type ReactNode } from 'react'
import { useAuth } from '../hooks/useAuth'
import { goalService, onGoalsChanged } from '../services/goalService'
import { isUniversity, type University } from '../theme/colors'
import { findMainGoal } from '../utils/mainGoal'
import { UniversityContext } from './UniversityContext'

interface LoadedUniversity {
  userId: number
  university: University | null
}

// La universidad de la meta principal define los acentos de la app. Sin sesión o sin meta se
// queda la paleta Cuaderno.
export function UniversityProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const userId = user?.id ?? null
  const [loaded, setLoaded] = useState<LoadedUniversity | null>(null)

  useEffect(() => {
    if (userId === null) return
    const controller = new AbortController()
    let latestRequest = 0

    const load = () => {
      latestRequest += 1
      const request = latestRequest
      return goalService.list(controller.signal).then(
        (goals) => {
          // Una respuesta vieja no debe pisar la de la última meta agregada o quitada.
          if (request !== latestRequest) return
          const siglas = findMainGoal(goals)?.universidad
          setLoaded({ userId, university: siglas && isUniversity(siglas) ? siglas : null })
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
  }, [userId])

  const university = loaded?.userId === userId ? loaded.university : null

  return <UniversityContext value={university}>{children}</UniversityContext>
}
