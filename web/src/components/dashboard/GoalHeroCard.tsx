import { ArrowRight, Flag } from 'lucide-react'
import { Link } from 'react-router'
import type { ApiError } from '../../api/apiError'
import { paths } from '../../routes/paths'
import type { Goal } from '../../types/goal'
import { formatScore } from '../../utils/format'
import { preparationTones } from '../../utils/progressLabels'
import { universityShort } from '../../utils/universityLabels'
import { InlineError } from '../feedback/InlineError'
import { Badge } from '../ui/Badge'
import { buttonStyles } from '../ui/buttonStyles'
import { Card } from '../ui/Card'
import { Skeleton } from '../ui/Skeleton'
import { GoalProgress } from './GoalProgress'

function Metric({ label, value, tone = '' }: { label: string; value: string; tone?: string }) {
  return (
    <div className="min-w-0 space-y-0.5">
      <dt className="text-sm text-ink-muted">{label}</dt>
      <dd
        className={`font-display text-2xl font-bold tracking-tight tabular-nums sm:text-3xl ${tone}`}
      >
        {value}
      </dd>
    </div>
  )
}

interface GoalHeroCardProps {
  goal: Goal | null
  loading: boolean
  error: ApiError | null
  onRetry: () => void
}

// La tarjeta principal del inicio: la carrera meta y qué tan cerca está el postulante de su
// último ingresante, con el puntaje proyectado de su último simulacro completo.
export function GoalHeroCard({ goal, loading, error, onRetry }: GoalHeroCardProps) {
  if (loading) {
    return (
      <Card className="space-y-5">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-16 w-full" />
      </Card>
    )
  }
  if (error) {
    return (
      <Card>
        <InlineError message={error.message} onRetry={onRetry} />
      </Card>
    )
  }
  if (!goal) {
    return (
      <Card className="flex flex-col items-start gap-4">
        <span className="rounded-xl bg-chip p-3 text-primary">
          <Flag aria-hidden className="size-6" />
        </span>
        <div className="space-y-1">
          <h2 className="text-xl font-bold">Elige la carrera a la que postulas</h2>
          <p className="text-ink-muted">
            Te mostraremos el puntaje del último ingresante y cuánto te falta para alcanzarlo.
          </p>
        </div>
        <Link to={paths.careers} className={buttonStyles('primary')}>
          Elegir mi carrera
        </Link>
      </Card>
    )
  }

  const psp = goal.ultimoPsp
  const cutoff = goal.puntajeUltimoIngresante
  const difference = psp === null ? 0 : psp - cutoff

  return (
    <Card aria-labelledby="goal-title" className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-semibold text-primary">Tu meta</p>
          <h2 id="goal-title" className="text-2xl leading-tight font-bold tracking-tight">
            {goal.carrera}
          </h2>
          <p className="text-sm text-ink-muted">
            {universityShort(goal.universidad)} · Último ingresante del proceso{' '}
            {goal.procesoAdmision}
          </p>
        </div>
        {goal.estado && (
          <Badge tone={preparationTones[goal.estado]}>{goal.estadoDescripcion}</Badge>
        )}
      </div>

      {psp === null ? (
        <div className="space-y-4 rounded-xl bg-surface-muted p-5">
          <p className="text-ink-muted">
            El último ingresante obtuvo{' '}
            <strong className="text-ink">{formatScore(cutoff)} puntos</strong>. Rinde tu diagnóstico
            para calcular tu puntaje proyectado y ver cuánto te falta.
          </p>
          <Link to={paths.newExam} className={buttonStyles('primary', 'sm')}>
            Rendir diagnóstico
          </Link>
        </div>
      ) : (
        <>
          <dl className="grid grid-cols-3 gap-4">
            <Metric label="Tu puntaje proyectado" value={formatScore(psp)} tone="text-primary" />
            <Metric label="Último ingresante" value={formatScore(cutoff)} />
            <Metric
              label={difference >= 0 ? 'Lo superas por' : 'Te faltan'}
              value={formatScore(Math.round(Math.abs(difference)))}
              tone={difference >= 0 ? 'text-success' : 'text-ink'}
            />
          </dl>
          <GoalProgress score={psp} cutoff={cutoff} />
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-ink-muted">
            <p>Proyectado con tu último simulacro completo.</p>
            <Link
              to={paths.progress}
              className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
            >
              Ver mi progreso
              <ArrowRight aria-hidden className="size-4" />
            </Link>
          </div>
        </>
      )}
    </Card>
  )
}
