import { LoaderCircle } from 'lucide-react'
import { Link } from 'react-router'
import type { ApiError } from '../../api/apiError'
import { paths } from '../../routes/paths'
import type { TopicMastery } from '../../types/progress'
import { masteryTone } from '../../utils/progressLabels'
import { InlineError } from '../feedback/InlineError'
import { Card } from '../ui/Card'
import { CardSkeleton } from './DashboardPlaceholders'
import { masteryBar } from './masteryStyles'
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

const actionStyles =
  'shrink-0 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-primary transition hover:bg-chip focus-visible:outline-2 focus-visible:outline-accent disabled:cursor-wait disabled:opacity-60'

// Los temas con menos aciertos. Si el tema es del área de la meta, un clic empieza el
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
    <Card aria-labelledby="recommended-title" className="space-y-4 p-5">
      <div className="space-y-0.5">
        <h2 id="recommended-title" className="text-lg font-bold">
          Temas para reforzar
        </h2>
        <p className="text-sm text-ink-muted">Tus aciertos en todos los simulacros.</p>
      </div>
      {loading ? (
        <CardSkeleton />
      ) : error?.kind === 'forbidden' ? (
        <ProFeatureNotice message="Con PRO ves tus aciertos por tema y cuáles reforzar primero." />
      ) : error ? (
        <InlineError message={error.message} onRetry={onRetry} />
      ) : topics.length === 0 ? (
        <p className="text-sm text-ink-muted">Aparecerán cuando termines tu primer simulacro.</p>
      ) : (
        <ul className="divide-y divide-line">
          {topics.map((topic) => {
            const starting = startingTopicId === topic.temaId
            const percentage = Math.round(topic.porcentajeAciertos)
            return (
              <li key={topic.temaId} className="space-y-2 py-3 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{topic.tema}</p>
                    {topic.subtema && (
                      <p className="truncate text-sm text-ink-muted">{topic.subtema}</p>
                    )}
                  </div>
                  {topic.inGoalArea ? (
                    <button
                      type="button"
                      onClick={() => onPractice(topic.temaId)}
                      disabled={startingTopicId !== null}
                      aria-busy={starting}
                      aria-label={`Practicar ${topic.tema}`}
                      className={actionStyles}
                    >
                      {starting ? (
                        <LoaderCircle aria-hidden className="size-4 animate-spin" />
                      ) : (
                        'Practicar'
                      )}
                    </button>
                  ) : (
                    <Link to={paths.newExam} className={actionStyles}>
                      Practicar
                    </Link>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-muted">
                    <div
                      className={`h-full rounded-full ${masteryBar[masteryTone(percentage)]}`}
                      style={{ width: `${Math.max(percentage, 3)}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-sm font-semibold tabular-nums">
                    {percentage}%
                  </span>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}
