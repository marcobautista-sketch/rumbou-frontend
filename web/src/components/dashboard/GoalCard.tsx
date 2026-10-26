import { Trash2 } from 'lucide-react'
import type { Goal } from '../../types/goal'
import { formatScore } from '../../utils/format'
import { preparationTones } from '../../utils/progressLabels'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

interface GoalCardProps {
  goal: Goal
  onRemove: (goal: Goal) => void
}

export function GoalCard({ goal, onRemove }: GoalCardProps) {
  const { indicePreparacion, ultimoPsp, estado } = goal
  const progress =
    indicePreparacion === null ? 0 : Math.min(100, Math.round(indicePreparacion * 100))

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-semibold tracking-wide text-accent-ink uppercase">
            {goal.universidad} · {goal.procesoAdmision}
          </p>
          <h3 className="text-lg font-semibold break-words">{goal.carrera}</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(goal)}
          aria-label={`Quitar ${goal.carrera} de tus objetivos`}
        >
          <Trash2 aria-hidden className="size-4" />
        </Button>
      </div>

      {estado && indicePreparacion !== null && ultimoPsp !== null ? (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Badge tone={preparationTones[estado]}>{goal.estadoDescripcion}</Badge>
            <span className="font-display text-2xl font-bold">{indicePreparacion.toFixed(2)}</span>
          </div>
          <div
            role="progressbar"
            aria-label="Índice de preparación"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
            className="h-2 overflow-hidden rounded-full bg-surface-muted"
          >
            <div
              className="h-full rounded-full bg-accent transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-ink-muted">
            Tu último PSP es <strong className="text-ink">{formatScore(ultimoPsp)}</strong> y el
            último ingresante obtuvo {formatScore(goal.puntajeUltimoIngresante)}.
          </p>
        </div>
      ) : (
        <p className="text-sm text-ink-muted">
          Rinde un simulacro de esta área para calcular tu probabilidad de ingreso. El último
          ingresante obtuvo {formatScore(goal.puntajeUltimoIngresante)}.
        </p>
      )}
    </Card>
  )
}
