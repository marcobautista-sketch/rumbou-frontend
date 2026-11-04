import { ArrowRight, Trophy, UsersRound } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { paths } from '../../routes/paths'
import type { AcademicOffer } from '../../types/offer'
import { formatScore } from '../../utils/format'
import { scoringFor } from '../../utils/scoringRules'
import { buttonStyles } from '../ui/buttonStyles'
import { SelectField } from '../ui/SelectField'
import { Skeleton } from '../ui/Skeleton'

const universityOptions = [
  { value: 'UNI', label: 'UNI' },
  { value: 'UNMSM', label: 'San Marcos' },
]

interface CareerLookupProps {
  offers: AcademicOffer[] | null
  failed: boolean
}

// Consulta pública del catálogo: el puntaje del último ingresante y las vacantes de cada carrera.
export function CareerLookup({ offers, failed }: CareerLookupProps) {
  const [university, setUniversity] = useState('UNI')
  const careers = useMemo(
    () =>
      (offers ?? [])
        .filter((offer) => offer.universidad === university)
        .sort((a, b) => a.carrera.localeCompare(b.carrera, 'es')),
    [offers, university],
  )
  const [offerId, setOfferId] = useState<number | null>(null)
  const offer =
    careers.find((candidate) => candidate.id === offerId) ??
    careers.find((candidate) => candidate.carrera === 'Ingeniería de Sistemas') ??
    careers[0] ??
    null

  if (failed) {
    return (
      <p className="rounded-2xl border border-line bg-surface p-6 text-ink-muted">
        No pudimos cargar el catálogo de carreras en este momento. Puedes verlo completo al crear tu
        cuenta.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-5 rounded-2xl border border-line bg-surface p-5 shadow-card sm:p-7 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-8">
      <div className="space-y-4">
        <SelectField
          label="Universidad"
          value={university}
          onChange={(event) => {
            setUniversity(event.target.value)
            setOfferId(null)
          }}
        >
          {universityOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </SelectField>
        {offers ? (
          <SelectField
            label="Carrera"
            value={offer?.id ?? ''}
            onChange={(event) => setOfferId(Number(event.target.value))}
          >
            {careers.map((career) => (
              <option key={career.id} value={career.id}>
                {career.carrera}
              </option>
            ))}
          </SelectField>
        ) : (
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-11 w-full" />
          </div>
        )}
      </div>

      <div className="flex flex-col justify-between gap-5 rounded-xl bg-surface-muted p-5">
        {offer ? (
          <>
            <div className="space-y-1">
              <p className="text-sm text-ink-muted">
                {offer.universidad === 'UNI' ? 'UNI' : `San Marcos · Área ${offer.area}`} · Proceso{' '}
                {offer.procesoAdmision}
              </p>
              <p className="font-display text-xl font-bold">{offer.carrera}</p>
            </div>
            <dl className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <dt className="flex items-center gap-1.5 text-sm text-ink-muted">
                  <Trophy aria-hidden className="size-4" />
                  Último ingresante
                </dt>
                <dd className="font-display text-3xl font-bold text-primary tabular-nums">
                  {formatScore(offer.puntajeUltimoIngresante)}
                </dd>
                <dd className="text-xs text-ink-muted">
                  de {formatScore(scoringFor(offer.universidad)?.maxScore ?? 0)} puntos
                </dd>
              </div>
              <div className="space-y-1">
                <dt className="flex items-center gap-1.5 text-sm text-ink-muted">
                  <UsersRound aria-hidden className="size-4" />
                  Vacantes
                </dt>
                <dd className="font-display text-3xl font-bold tabular-nums">{offer.vacantes}</dd>
              </div>
            </dl>
            <Link to={paths.register} className={`${buttonStyles('primary')} self-start`}>
              Mide cuánto te falta
              <ArrowRight aria-hidden className="size-4" />
            </Link>
          </>
        ) : (
          <Skeleton className="h-40 w-full" />
        )}
      </div>
    </div>
  )
}
