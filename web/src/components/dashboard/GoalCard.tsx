import { Trash2 } from 'lucide-react'
import type { Goal } from '../../types/goal'
import { formatScore } from '../../utils/format'
import { preparationTones } from '../../utils/progressLabels'
import { universityShort } from '../../utils/universityLabels'
import { Badge } from '../ui/Badge'
import { Card } from '../ui/Card'
import { GoalProgress } from './GoalProgress'

interface GoalCardProps {
  goal: Goal
  onRemove: (goal: Goal) => void
}

export function GoalCard({ goal, onRemove }: GoalCardProps) {
  const { ultimoPsp, estado, puntajeUltimoIngresante: cutoff } = goal

  return (
    <Card className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-semibold text-primary">
            {universityShort(goal.universidad)} · Proceso {goal.procesoAdmision}
          </p>
          <h3 className="text-lg leading-snug font-bold break-words">{goal.carrera}</h3>
        </div>
        <button
          type="button"
          onClick={() => onRemove(goal)}
          aria-label={`Quitar ${goal.carrera} de tus metas`}
          title="Quitar meta"
          className="rounded-lg p-2 text-ink-muted transition hover:bg-danger-soft hover:text-danger focus-visible:outline-2 focus-visible:outline-accent"
        >
          <Trash2 aria-hidden className="size-4" />
        </button>
      </div>

      {ultimoPsp !== null ? (
        <>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm text-ink-muted">Tu puntaje proyectado</dt>
              <dd className="font-display text-2xl font-bold text-primary tabular-nums">
                {formatScore(ultimoPsp)}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-ink-muted">Último ingresante</dt>
              <dd className="font-display text-2xl font-bold tabular-nums">
                {formatScore(cutoff)}
              </dd>
            </div>
          </dl>
          <GoalProgress score={ultimoPsp} cutoff={cutoff} />
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-ink-muted">
            <span>Estás al {Math.round((ultimoPsp / cutoff) * 100)} % del último ingresante</span>
            {estado && <Badge tone={preparationTones[estado]}>{goal.estadoDescripcion}</Badge>}
          </div>
        </>
      ) : (
        <p className="rounded-xl bg-surface-muted p-4 text-sm text-ink-muted">
          El último ingresante obtuvo{' '}
          <strong className="text-ink">{formatScore(cutoff)} puntos</strong>. Rinde un simulacro
          completo de esta área para calcular tu puntaje proyectado.
        </p>
      )}
    </Card>
  )
}
