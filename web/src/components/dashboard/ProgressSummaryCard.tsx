import { Flag } from 'lucide-react'
import { Link } from 'react-router'
import type { ApiError } from '../../api/apiError'
import { paths } from '../../routes/paths'
import type { Goal } from '../../types/goal'
import type { ScoreHistoryEntry } from '../../types/progress'
import { formatScore } from '../../utils/format'
import { InlineError } from '../feedback/InlineError'
import { buttonStyles } from '../ui/buttonStyles'
import { Card } from '../ui/Card'
import { EmptyState } from '../ui/EmptyState'
import { Skeleton } from '../ui/Skeleton'
import { FirstExamEmptyState } from './DashboardPlaceholders'
import { ProFeatureNotice } from './ProFeatureNotice'
import { ScoreHistoryChart } from './ScoreHistoryChart'

interface ProgressSummaryCardProps {
  goal: Goal | null
  goalLoading: boolean
  history: ScoreHistoryEntry[] | null
  historyLoading: boolean
  historyError: ApiError | null
  onRetryHistory: () => void
}

function ScoreItem({
  label,
  score,
  highlight = false,
}: {
  label: string
  score: number | null
  highlight?: boolean
}) {
  return (
    <div>
      <dt className="text-sm text-ink-muted">{label}</dt>
      <dd className={`font-display text-2xl font-bold ${highlight ? 'text-accent-ink' : ''}`}>
        {score === null ? '—' : formatScore(score)}
      </dd>
    </div>
  )
}

// Compara el primer puntaje, el actual y el del último ingresante de la carrera meta.
export function ProgressSummaryCard({
  goal,
  goalLoading,
  history,
  historyLoading,
  historyError,
  onRetryHistory,
}: ProgressSummaryCardProps) {
  return (
    <Card aria-labelledby="progress-title" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="progress-title" className="text-lg font-semibold">
          Tu progreso
        </h2>
        {goal && (
          <Link to={paths.progress} className="text-sm font-semibold text-accent-ink">
            Ver el detalle
          </Link>
        )}
      </div>

      {goalLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : !goal ? (
        <EmptyState
          icon={Flag}
          title="Elige tu carrera meta"
          message="Compararemos tu puntaje con el del último ingresante de la carrera a la que postulas."
          action={
            <Link to={paths.progress} className={buttonStyles('primary')}>
              Elegir mi carrera
            </Link>
          }
        />
      ) : goal.ultimoPsp === null ? (
        <FirstExamEmptyState />
      ) : (
        <>
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <ScoreItem label="Puntaje inicial" score={history?.[0]?.psp ?? null} />
            <ScoreItem label="Puntaje actual" score={goal.ultimoPsp} highlight />
            <ScoreItem label="Último ingresante" score={goal.puntajeUltimoIngresante} />
          </dl>
          {historyLoading ? (
            <Skeleton className="h-52 w-full" />
          ) : historyError?.kind === 'forbidden' ? (
            <ProFeatureNotice message="Con PRO ves cómo evoluciona tu puntaje en cada simulacro." />
          ) : historyError ? (
            <InlineError message={historyError.message} onRetry={onRetryHistory} />
          ) : (
            history &&
            history.length > 1 && (
              <ScoreHistoryChart
                history={history}
                cutoff={goal.puntajeUltimoIngresante}
                height={220}
              />
            )
          )}
        </>
      )}
    </Card>
  )
}
