import { ChevronRight, Flag } from 'lucide-react'
import type { AcademicOffer } from '../../types/offer'
import { careerFaculty } from '../../utils/careerLabels'
import { formatScore } from '../../utils/format'
import { scoringFor } from '../../utils/scoringRules'
import { areaLabel } from '../../utils/universityLabels'
import { Badge } from '../ui/Badge'

interface CareerCardProps {
  offer: AcademicOffer
  isGoal: boolean
  onSelect: (offer: AcademicOffer) => void
}

export function CareerCard({ offer, isGoal, onSelect }: CareerCardProps) {
  const faculty = careerFaculty(offer)
  const maxScore = scoringFor(offer.universidad)?.maxScore

  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(offer)}
        className="group flex h-full w-full flex-col gap-4 rounded-2xl bg-surface p-5 text-left shadow-card transition hover:-translate-y-0.5 hover:shadow-raised focus-visible:outline-2 focus-visible:outline-accent"
      >
        <div className="flex w-full items-start justify-between gap-2">
          <p className="text-sm font-semibold text-primary">
            {areaLabel(offer.universidad, offer.areaNombre)}
          </p>
          {isGoal ? (
            <Badge tone="success">
              <Flag aria-hidden className="size-3.5" />
              Tu meta
            </Badge>
          ) : (
            <ChevronRight
              aria-hidden
              className="size-5 text-ink-muted transition group-hover:translate-x-0.5 group-hover:text-primary"
            />
          )}
        </div>
        <div className="space-y-1">
          <h2 className="text-lg leading-snug font-bold break-words">{offer.carrera}</h2>
          {faculty && <p className="text-sm text-ink-muted">{faculty}</p>}
        </div>
        <dl className="mt-auto grid grid-cols-2 gap-3 border-t border-line pt-4">
          <div>
            <dt className="text-xs text-ink-muted">Último ingresante</dt>
            <dd className="font-display text-xl font-bold tabular-nums">
              {formatScore(offer.puntajeUltimoIngresante)}
              {maxScore && (
                <span className="text-sm font-medium text-ink-muted">
                  {' '}
                  / {formatScore(maxScore)}
                </span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-ink-muted">Vacantes</dt>
            <dd className="font-display text-xl font-bold tabular-nums">{offer.vacantes}</dd>
          </div>
        </dl>
      </button>
    </li>
  )
}
