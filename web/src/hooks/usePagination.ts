import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router'

export const PAGE_SIZES: readonly number[] = [10, 25, 50, 100]
const DEFAULT_PAGE_SIZE = 10

function readPositiveInteger(value: string | null, fallback: number) {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

export function usePagination() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = readPositiveInteger(searchParams.get('page'), 1)
  const requestedSize = readPositiveInteger(searchParams.get('size'), DEFAULT_PAGE_SIZE)
  const size = PAGE_SIZES.includes(requestedSize) ? requestedSize : DEFAULT_PAGE_SIZE

  const setPage = useCallback(
    (nextPage: number) =>
      setSearchParams((params) => {
        params.set('page', String(nextPage))
        return params
      }),
    [setSearchParams],
  )

  const setSize = useCallback(
    (nextSize: number) =>
      setSearchParams((params) => {
        params.set('size', String(nextSize))
        params.set('page', '1')
        return params
      }),
    [setSearchParams],
  )

  const setFilters = useCallback(
    (changes: Record<string, string | null>) =>
      setSearchParams((params) => {
        Object.entries(changes).forEach(([key, value]) =>
          value ? params.set(key, value) : params.delete(key),
        )
        params.set('page', '1')
        return params
      }),
    [setSearchParams],
  )

  const apiParams = useMemo(() => ({ page: page - 1, size }), [page, size])

  return { page, size, searchParams, apiParams, setPage, setSize, setFilters }
}
