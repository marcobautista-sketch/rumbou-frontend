import { Clock } from 'lucide-react'
import { Link } from 'react-router'
import type { ApiError } from '../../api/apiError'
import { paths } from '../../routes/paths'
import type { TopicMastery } from '../../types/progress'
import { masteryTone } from '../../utils/progressLabels'
import { InlineError } from '../feedback/InlineError'
import { Badge } from '../ui/Badge'
import { Card } from '../ui/Card'
import { CardSkeleton, FirstExamEmptyState } from './DashboardPlaceholders'
import { ProFeatureNotice } from './ProFeatureNotice'

export interface Recommendation extends TopicMastery {
  inGoalArea: boolean
  subtema: string | null
  minutes: number | null
}

interface RecommendedTopicsProps {
  topics: Recommendation[]
  loading: boolean
  error: ApiError | null
  startingTopicId: number | null
  onRetry: () => void
  onPractice: (topicId: number) => void
}

const cardStyles =
  'block h-full rounded-2xl bg-surface p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-raised focus-visible:outline-2 focus-visible:outline-accent'

function TopicCardContent({ topic, starting }: { topic: Recommendation; starting: boolean }) {
  return (
    <>
      <div className="flex items-start justify-between gap-2">
        <p className="font-semibold">{topic.tema}</p>
        <Badge tone={masteryTone(topic.porcentajeAciertos)}>{topic.porcentajeAciertos}%</Badge>
      </div>
      {topic.subtema && <p className="mt-1 text-sm text-ink-muted">Repasa: {topic.subtema}</p>}
      <p className="mt-3 flex items-center justify-between gap-2 text-sm text-ink-muted">
        {topic.minutes !== null && (
          <span className="flex items-center gap-1.5">
            <Clock aria-hidden className="size-4" />
            {topic.minutes} min
          </span>
        )}
        {topic.inGoalArea && (
          <span className="ml-auto font-semibold text-accent-ink">
            {starting ? 'Preparando…' : 'Practicar ahora'}
          </span>
        )}
      </p>
    </>
  )
}

// Los tres temas con menos aciertos. Si el tema es del área de la meta, un clic empieza el
// simulacro; si no, lleva al formulario para elegir el área.
export function RecommendedTopics({
  topics,
  loading,
  error,
  startingTopicId,
  onRetry,
  onPractice,
}: RecommendedTopicsProps) {
  return (
    <section aria-labelledby="recommended-title" className="space-y-3">
      <h2 id="recommended-title" className="text-lg font-semibold">
        Recomendado para ti
      </h2>
      {loading ? (
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <Card key={index}>
              <CardSkeleton />
            </Card>
          ))}
        </div>
      ) : error?.kind === 'forbidden' ? (
        <ProFeatureNotice message="Con PRO te recomendamos los temas que más necesitas reforzar." />
      ) : error ? (
        <InlineError message={error.message} onRetry={onRetry} />
      ) : topics.length === 0 ? (
        <FirstExamEmptyState />
      ) : (
        <ul className="grid gap-4 md:grid-cols-3">
          {topics.map((topic) => {
            const starting = startingTopicId === topic.temaId
            return (
              <li key={topic.temaId}>
                {topic.inGoalArea ? (
                  <button
                    type="button"
                    onClick={() => onPractice(topic.temaId)}
                    disabled={startingTopicId !== null}
                    aria-busy={starting}
                    className={`${cardStyles} w-full text-left disabled:cursor-wait disabled:opacity-70`}
                  >
                    <TopicCardContent topic={topic} starting={starting} />
                  </button>
                ) : (
                  <Link to={paths.newExam} className={cardStyles}>
                    <TopicCardContent topic={topic} starting={false} />
                  </Link>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
