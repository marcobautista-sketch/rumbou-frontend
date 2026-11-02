import { formatScore } from '../../utils/format'

// El último ingresante queda fijo al 80 % de la barra: así se ve tanto lo que falta como lo
// que sobra cuando el puntaje lo supera.
const CUTOFF_POSITION = 0.8

interface GoalProgressProps {
  score: number
  cutoff: number
}

export function GoalProgress({ score, cutoff }: GoalProgressProps) {
  const fill = Math.min(100, Math.max(2, (score / (cutoff / CUTOFF_POSITION)) * 100))
  const percentage = Math.round((score / cutoff) * 100)
  const reached = score >= cutoff

  return (
    <div className="space-y-2">
      <div
        role="img"
        aria-label={`Tu puntaje proyectado es ${formatScore(score)}, el ${percentage} % del último ingresante (${formatScore(cutoff)}).`}
        className="relative h-3 rounded-full bg-surface-muted"
      >
        <div
          className={`h-full rounded-full transition-all ${reached ? 'bg-success' : 'bg-accent'}`}
          style={{ width: `${fill}%` }}
        />
        <div
          aria-hidden
          className="absolute -inset-y-1.5 w-0.5 rounded-full bg-ink"
          style={{ left: `${CUTOFF_POSITION * 100}%` }}
        />
      </div>
      <div aria-hidden className="relative h-5 text-xs text-ink-muted">
        <span>0</span>
        <span
          className="absolute -translate-x-1/2 font-semibold whitespace-nowrap text-ink"
          style={{ left: `${CUTOFF_POSITION * 100}%` }}
        >
          Último ingresante
        </span>
      </div>
    </div>
  )
}
