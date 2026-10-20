import { useCallback } from 'react'
import { areaService } from '../api/areaService'
import type { Topic } from '../types/exam'
import { useFetch } from './useFetch'

const noTopics: Topic[] = []

export function useAreaTopics(areaId: number | null) {
  const fetchAreas = useCallback((signal: AbortSignal) => areaService.list(signal), [])
  const fetchTopics = useCallback(
    (signal: AbortSignal) =>
      areaId ? areaService.listTopics(areaId, signal) : Promise.resolve(noTopics),
    [areaId],
  )

  return { areas: useFetch(fetchAreas), topics: useFetch(fetchTopics) }
}
