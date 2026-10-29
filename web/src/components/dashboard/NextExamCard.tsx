import { CalendarDays } from 'lucide-react'
import type { ApiError } from '../../api/apiError'
import type { Area } from '../../types/exam'
import { daysUntil, formatDate } from '../../utils/format'
import { InlineError } from '../feedback/InlineError'
import { Badge } from '../ui/Badge'
import { Card } from '../ui/Card'
import { CardSkeleton } from './DashboardPlaceholders'

interface NextExamCardProps {
  area: Area | null
  hasGoal: boolean
  loading: boolean
  error: ApiError | null
  onRetry: () => void
}

export function NextExamCard({ area, hasGoal, loading, error, onRetry }: NextExamCardProps) {
  const examDays = area?.fechaProximoExamen ? daysUntil(area.fechaProximoExamen) : null

  return (
    <Card aria-labelledby="exam-date-title" className="space-y-3">
      <h2 id="exam-date-title" className="flex items-center gap-2 text-lg font-semibold">
        <CalendarDays aria-hidden className="size-5 text-accent-ink" />
        Próximo examen
      </h2>
      {loading ? (
        <CardSkeleton />
      ) : error ? (
        <InlineError message={error.message} onRetry={onRetry} />
      ) : area?.fechaProximoExamen && examDays !== null ? (
        <div className="space-y-2">
          <p className="font-display text-3xl font-bold">
            {examDays > 0 ? `${examDays} ${examDays === 1 ? 'día' : 'días'}` : '¡Es hoy!'}
          </p>
          <p className="text-ink-muted">
            {formatDate(area.fechaProximoExamen)} · Proceso {area.procesoProximo}
          </p>
          {area.fechaExamenConfirmada === false && <Badge tone="warning">Fecha estimada</Badge>}
        </div>
      ) : (
        <p className="text-ink-muted">
          {hasGoal
            ? 'La universidad aún no anuncia la fecha del próximo examen.'
            : 'Elige tu carrera meta para ver cuánto falta para tu examen.'}
        </p>
      )}
    </Card>
  )
}
