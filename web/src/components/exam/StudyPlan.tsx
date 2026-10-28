import { BookOpen, ExternalLink, PlayCircle } from 'lucide-react'
import { useCallback } from 'react'
import { studyPlanService } from '../../api/studyPlanService'
import { useFetch } from '../../hooks/useFetch'
import type { TopicMistakes } from '../../utils/examSummary'
import { InlineError } from '../feedback/InlineError'
import { Skeleton } from '../ui/Skeleton'

const MAX_TOPICS = 3

function LoadingRow({ label }: { label: string }) {
  return (
    <div role="status" aria-label={label} className="grid gap-3 sm:grid-cols-3">
      {[0, 1, 2].map((index) => (
        <Skeleton key={index} className="h-28 w-full" />
      ))}
    </div>
  )
}

function TopicVideos({ topicId }: { topicId: number }) {
  const fetchVideos = useCallback(
    (signal: AbortSignal) => studyPlanService.videos(topicId, signal),
    [topicId],
  )
  const { data, error, loading, retry } = useFetch(fetchVideos)

  if (loading) return <LoadingRow label="Buscando videos" />
  if (error || !data) {
    return <InlineError message="No pudimos traer los videos." onRetry={retry} />
  }

  return (
    <div className="space-y-2">
      {data.videos.length > 0 && (
        <ul className="grid gap-3 sm:grid-cols-3">
          {data.videos.map((video) => (
            <li key={video.videoId}>
              <a
                href={video.url}
                target="_blank"
                rel="noreferrer"
                className="group block space-y-1 rounded-xl focus-visible:outline-2 focus-visible:outline-accent"
              >
                {video.miniaturaUrl && (
                  <img
                    src={video.miniaturaUrl}
                    alt=""
                    loading="lazy"
                    className="aspect-video w-full rounded-xl object-cover"
                  />
                )}
                <p className="line-clamp-2 text-sm font-medium group-hover:underline">
                  {video.titulo}
                </p>
                <p className="text-xs text-ink-muted">{video.canal}</p>
              </a>
            </li>
          ))}
        </ul>
      )}
      <a
        href={data.busquedaUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1 text-sm font-semibold text-accent-ink hover:underline"
      >
        {data.videos.length > 0
          ? 'Ver más videos en YouTube'
          : `Buscar clases de ${data.tema} en YouTube`}
        <ExternalLink aria-hidden className="size-4" />
      </a>
    </div>
  )
}

function TopicBooks({ topicId, topic }: { topicId: number; topic: string }) {
  const fetchBooks = useCallback(
    (signal: AbortSignal) => studyPlanService.books(topicId, topic, signal),
    [topicId, topic],
  )
  const { data, error, loading, retry } = useFetch(fetchBooks)

  if (loading) return <LoadingRow label="Buscando libros" />
  if (error || !data) {
    return <InlineError message="No pudimos traer los libros." onRetry={retry} />
  }
  if (data.length === 0) {
    return <p className="text-sm text-ink-muted">No encontramos libros para este tema.</p>
  }

  return (
    <div className="space-y-2">
      <ul className="grid gap-3 sm:grid-cols-3">
        {data.map((book) => (
          <li key={book.url}>
            <a
              href={book.url}
              target="_blank"
              rel="noreferrer"
              className="group flex gap-3 rounded-xl focus-visible:outline-2 focus-visible:outline-accent"
            >
              {book.coverUrl ? (
                <img
                  src={book.coverUrl}
                  alt=""
                  loading="lazy"
                  className="h-24 w-16 shrink-0 rounded-md bg-surface-muted object-cover"
                />
              ) : (
                <span className="grid h-24 w-16 shrink-0 place-items-center rounded-md bg-surface-muted">
                  <BookOpen aria-hidden className="size-6 text-ink-muted" />
                </span>
              )}
              <span className="space-y-1">
                <span className="line-clamp-2 text-sm font-medium group-hover:underline">
                  {book.title}
                </span>
                <span className="block text-xs text-ink-muted">
                  {[book.authors.slice(0, 2).join(', '), book.year].filter(Boolean).join(' · ')}
                </span>
              </span>
            </a>
          </li>
        ))}
      </ul>
      <p className="text-xs text-ink-muted">Fuente: {data[0].source}</p>
    </div>
  )
}

export function StudyPlan({ topics }: { topics: TopicMistakes[] }) {
  if (topics.length === 0) {
    return (
      <p className="text-ink-muted">¡Respondiste todo bien! Prueba ahora un simulacro completo.</p>
    )
  }

  return (
    <ol className="space-y-6">
      {topics.slice(0, MAX_TOPICS).map((topic) => (
        <li
          key={topic.temaId}
          className="space-y-4 border-t border-line pt-4 first:border-0 first:pt-0"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-lg font-semibold">{topic.tema}</h3>
            <span className="text-sm text-ink-muted">
              {topic.incorrect} incorrectas · {topic.blank} en blanco
            </span>
          </div>
          <section aria-label={`Videos de ${topic.tema}`} className="space-y-2">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-ink-muted">
              <PlayCircle aria-hidden className="size-4" /> Videos para repasar
            </h4>
            <TopicVideos topicId={topic.temaId} />
          </section>
          <section aria-label={`Libros de ${topic.tema}`} className="space-y-2">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-ink-muted">
              <BookOpen aria-hidden className="size-4" /> Libros recomendados
            </h4>
            <TopicBooks topicId={topic.temaId} topic={topic.tema} />
          </section>
        </li>
      ))}
    </ol>
  )
}
