import { CircleCheck, GraduationCap, Plus, SearchX } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { goalService } from '../../api/goalService'
import { offerService } from '../../api/offerService'
import { InlineError } from '../../components/feedback/InlineError'
import { PageHeader } from '../../components/layout/PageHeader'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { buttonStyles } from '../../components/ui/buttonStyles'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { SelectField } from '../../components/ui/SelectField'
import { SkeletonList } from '../../components/ui/Skeleton'
import { TextField } from '../../components/ui/TextField'
import { useDebounce } from '../../hooks/useDebounce'
import { useFetch } from '../../hooks/useFetch'
import { paths } from '../../routes/paths'
import type { AcademicOffer } from '../../types/offer'
import { formatScore } from '../../utils/format'
import { notify } from '../../utils/notify'

const universities = [
  { value: '', label: 'Todas' },
  { value: 'UNI', label: 'UNI' },
  { value: 'UNMSM', label: 'San Marcos' },
]

interface OfferCardProps {
  offer: AcademicOffer
  isGoal: boolean
  adding: boolean
  onAdd: (offer: AcademicOffer) => void
}

function OfferCard({ offer, isGoal, adding, onAdd }: OfferCardProps) {
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-lg font-semibold">{offer.carrera}</h2>
        <Badge tone="brand">{offer.universidad}</Badge>
      </div>
      <p className="text-sm text-ink-muted">
        {offer.facultad} · {offer.areaNombre} · Proceso {offer.procesoAdmision}
      </p>
      <dl className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <dt className="text-ink-muted">Último ingresante</dt>
          <dd className="font-display text-xl font-bold">
            {formatScore(offer.puntajeUltimoIngresante)}
          </dd>
        </div>
        <div>
          <dt className="text-ink-muted">Vacantes</dt>
          <dd className="font-display text-xl font-bold">{offer.vacantes}</dd>
        </div>
      </dl>
      <div className="mt-auto">
        {isGoal ? (
          <p className="flex items-center gap-2 font-medium text-success">
            <CircleCheck aria-hidden className="size-5" /> Ya es una de tus metas
          </p>
        ) : (
          <Button
            variant="secondary"
            size="sm"
            loading={adding}
            onClick={() => onAdd(offer)}
            aria-label={`Agregar ${offer.carrera} de la ${offer.universidad} a mis metas`}
          >
            <Plus aria-hidden className="size-4" /> Agregar a mis metas
          </Button>
        )}
      </div>
    </Card>
  )
}

// Catálogo público de carreras: el texto y la universidad viven en la URL para compartir la búsqueda.
export default function CareersPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [addingId, setAddingId] = useState<number | null>(null)
  const search = searchParams.get('q') ?? ''
  const university = searchParams.get('universidad') ?? ''
  const debouncedSearch = useDebounce(search.trim())

  const fetchOffers = useCallback(
    (signal: AbortSignal) =>
      offerService.search(
        { universidad: university || undefined, carrera: debouncedSearch || undefined },
        signal,
      ),
    [university, debouncedSearch],
  )
  const fetchGoals = useCallback((signal: AbortSignal) => goalService.list(signal), [])
  const offers = useFetch(fetchOffers)
  const goals = useFetch(fetchGoals)
  const goalOfferIds = useMemo(
    () => new Set(goals.data?.map((goal) => goal.ofertaAcademicaId)),
    [goals.data],
  )
  const sortedOffers = useMemo(
    () =>
      [...(offers.data ?? [])].sort(
        (a, b) =>
          a.carrera.localeCompare(b.carrera, 'es') || a.universidad.localeCompare(b.universidad),
      ),
    [offers.data],
  )

  const setFilter = (key: string, value: string) =>
    setSearchParams(
      (params) => {
        if (value) params.set(key, value)
        else params.delete(key)
        return params
      },
      { replace: true },
    )

  const addGoal = async (offer: AcademicOffer) => {
    setAddingId(offer.id)
    try {
      await goalService.create(offer.id)
      notify.success(`${offer.carrera} ya es una de tus metas.`)
      goals.retry()
    } catch (error) {
      // En el plan gratuito, la segunda meta responde 403 con el motivo: se muestra tal cual.
      notify.error(error)
    } finally {
      setAddingId(null)
    }
  }

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
      <PageHeader
        title="Carreras"
        description="Compara el puntaje del último ingresante y las vacantes, y agrega a tus metas la carrera a la que postulas."
        breadcrumbs={[{ label: 'Carreras' }]}
        actions={
          <Link to={paths.progress} className={buttonStyles('ghost', 'sm')}>
            <GraduationCap aria-hidden className="size-4" /> Ver mis metas
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
        <TextField
          label="Buscar carrera"
          type="search"
          placeholder="Por ejemplo: sistemas, medicina, civil"
          value={search}
          onChange={(event) => setFilter('q', event.target.value)}
        />
        <SelectField
          label="Universidad"
          value={university}
          onChange={(event) => setFilter('universidad', event.target.value)}
        >
          {universities.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </SelectField>
      </div>

      {offers.loading ? (
        <SkeletonList rows={3} label="Buscando carreras" />
      ) : offers.error ? (
        <InlineError message={offers.error.message} onRetry={offers.retry} />
      ) : sortedOffers.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No encontramos carreras"
          message="Prueba con otra palabra o elige todas las universidades."
          action={
            <Button variant="secondary" onClick={() => setSearchParams({}, { replace: true })}>
              Limpiar la búsqueda
            </Button>
          }
        />
      ) : (
        <>
          <p className="text-sm text-ink-muted" aria-live="polite">
            {sortedOffers.length} {sortedOffers.length === 1 ? 'carrera' : 'carreras'}
          </p>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sortedOffers.map((offer) => (
              <li key={offer.id} className="flex">
                <OfferCard
                  offer={offer}
                  isGoal={goalOfferIds.has(offer.id)}
                  adding={addingId === offer.id}
                  onAdd={addGoal}
                />
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  )
}
