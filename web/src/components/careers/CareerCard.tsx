import { ChevronRight, Flag, Trophy, UsersRound } from 'lucide-react'
import type { AcademicOffer } from '../../types/offer'
import { formatScore } from '../../utils/format'
import { Badge } from '../ui/Badge'

interface CareerCardProps {
  offer: AcademicOffer
  isGoal: boolean
  onSelect: (offer: AcademicOffer) => void
}

export function CareerCard({ offer, isGoal, onSelect }: CareerCardProps) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(offer)}
        className="flex h-full w-full flex-col gap-3 rounded-2xl bg-surface p-5 text-left shadow-card transition hover:-translate-y-0.5 hover:shadow-raised focus-visible:outline-2 focus-visible:outline-accent"
      >
        <div className="flex w-full items-start justify-between gap-2">
          <p className="text-sm font-semibold tracking-wide text-accent-ink uppercase">
            {offer.universidad} · {offer.areaNombre}
          </p>
          {isGoal && (
            <Badge tone="success">
              <Flag aria-hidden className="size-3.5" />
              Tu objetivo
            </Badge>
          )}
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold break-words">{offer.carrera}</h2>
          <p className="text-sm text-ink-muted">{offer.facultad}</p>
        </div>
        <dl className="mt-auto flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink-muted">
          <div className="flex items-center gap-1.5">
            <UsersRound aria-hidden className="size-4" />
            <dt className="sr-only">Vacantes</dt>
            <dd>{offer.vacantes} vacantes</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <Trophy aria-hidden className="size-4" />
            <dt className="sr-only">Puntaje del último ingresante</dt>
            <dd>Último ingresante: {formatScore(offer.puntajeUltimoIngresante)}</dd>
          </div>
        </dl>
        <span className="flex items-center gap-1 text-sm font-semibold text-accent-ink">
          Ver detalle
          <ChevronRight aria-hidden className="size-4" />
        </span>
      </button>
    </li>
  )
}
