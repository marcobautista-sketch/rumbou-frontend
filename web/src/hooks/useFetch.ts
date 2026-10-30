import { useCallback, useEffect, useState } from 'react'
import { toApiError, type ApiError } from '../api/apiError'

type Fetcher<T> = (signal: AbortSignal) => Promise<T>

interface FetchResult<T> {
  fetcher: Fetcher<T>
  attempt: number
  data: T | null
  error: ApiError | null
}

// Pide datos al montar el componente y cada vez que cambia el fetcher (por ejemplo, otra página).
// El fetcher debe venir de useCallback: si se creara en cada render, se pediría sin parar.
export function useFetch<T>(fetcher: Fetcher<T>) {
  const [result, setResult] = useState<FetchResult<T> | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    // Si el componente se desmonta o el fetcher cambia antes de que llegue la respuesta, la
    // petición se cancela y su resultado se ignora: así no se pinta una respuesta vieja.
    const controller = new AbortController()
    const settle = (data: T | null, error: ApiError | null) => {
      if (!controller.signal.aborted) setResult({ fetcher, attempt, data, error })
    }

    fetcher(controller.signal).then(
      (data) => settle(data, null),
      (error: unknown) => settle(null, toApiError(error)),
    )

    return () => controller.abort()
  }, [fetcher, attempt])

  const retry = useCallback(() => setAttempt((value) => value + 1), [])
  // Está cargando mientras el último resultado guardado no sea de esta petición (mismo fetcher
  // y mismo intento). Así no hace falta un estado "loading" aparte que actualizar en el efecto.
  const loading = result?.fetcher !== fetcher || result.attempt !== attempt

  return {
    data: result?.data ?? null,
    error: loading ? null : (result?.error ?? null),
    loading,
    retry,
  }
}
