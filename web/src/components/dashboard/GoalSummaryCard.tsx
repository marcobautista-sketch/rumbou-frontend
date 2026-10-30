import { Flag } from 'lucide-react'
import { Link } from 'react-router'
import type { ApiError } from '../../api/apiError'
import { paths } from '../../routes/paths'
import type { Goal } from '../../types/goal'
import { preparationTones } from '../../utils/progressLabels'
import { InlineError } from '../feedback/InlineError'
import { Badge } from '../ui/Badge'
import { buttonStyles } from '../ui/buttonStyles'
import { Card } from '../ui/Card'
import { CardSkeleton } from './DashboardPlaceholders'

interface GoalSummaryCardProps {
  goal: Goal | null
  areaName: string | null
  loading: boolean
  error: ApiError | null
  onRetry: () => void
}

export function GoalSummaryCard({ goal, areaName, loading, error, onRetry }: GoalSummaryCardProps) {
  return (
    <Card aria-labelledby="goal-title" className="space-y-3">
      <h2 id="goal-title" className="flex items-center gap-2 text-lg font-semibold">
        <Flag aria-hidden className="size-5 text-accent-ink" />
        Mi meta
      </h2>
      {loading ? (
        <CardSkeleton />
      ) : error ? (
        <InlineError message={error.message} onRetry={onRetry} />
      ) : goal ? (
        <div className="space-y-2">
          <p className="text-sm font-semibold tracking-wide text-ink-muted uppercase">
            {goal.universidad} · {areaName ?? goal.area}
          </p>
          <p className="font-display text-xl font-bold">{goal.carrera}</p>
          {goal.estado && (
            <Badge tone={preparationTones[goal.estado]}>{goal.estadoDescripcion}</Badge>
          )}
          <Link to={paths.progress} className="block text-sm font-semibold text-accent-ink">
            Ver todos mis objetivos
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-ink-muted">Aún no eliges la carrera a la que postulas.</p>
          <Link to={paths.progress} className={buttonStyles('secondary', 'sm')}>
            Elegir mi carrera
          </Link>
        </div>
      )}
    </Card>
  )
}
