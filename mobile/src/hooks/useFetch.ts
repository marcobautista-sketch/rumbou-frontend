import { useCallback, useEffect, useState } from 'react'
import { toApiError, type ApiError } from '../services/apiError'

type Fetcher<T> = (signal: AbortSignal) => Promise<T>

interface FetchResult<T> {
  fetcher: Fetcher<T>
  attempt: number
  data: T | null
  error: ApiError | null
}

export function useFetch<T>(fetcher: Fetcher<T>) {
  const [result, setResult] = useState<FetchResult<T> | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
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
  const loading = result?.fetcher !== fetcher || result.attempt !== attempt

  return {
    data: result?.data ?? null,
    error: loading ? null : (result?.error ?? null),
    loading,
    retry,
  }
}
