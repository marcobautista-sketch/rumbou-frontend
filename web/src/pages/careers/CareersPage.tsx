import { SearchX } from 'lucide-react'
import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { areaService } from '../../api/areaService'
import { goalService } from '../../api/goalService'
import { offerService } from '../../api/offerService'
import { CareerCard } from '../../components/careers/CareerCard'
import { CareerDetailModal } from '../../components/careers/CareerDetailModal'
import { CareerFilters, type CareerFilterValues } from '../../components/careers/CareerFilters'
import { InlineError } from '../../components/feedback/InlineError'
import { PageHeader } from '../../components/layout/PageHeader'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { SkeletonList } from '../../components/ui/Skeleton'
import { useDebounce } from '../../hooks/useDebounce'
import { useFetch } from '../../hooks/useFetch'
import { paths } from '../../routes/paths'
import { readCareerSort, sortCareers } from '../../utils/careerLabels'

export default function CareersPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const filters: CareerFilterValues = {
    search: searchParams.get('q') ?? '',
    universidad: searchParams.get('universidad') ?? '',
    area: searchParams.get('area') ?? '',
    sort: readCareerSort(searchParams.get('sort')),
  }
  const selectedId = Number(searchParams.get('detalle'))
  const hasActiveFilters = Boolean(filters.search || filters.universidad || filters.area)
  const debouncedSearch = useDebounce(filters.search.trim())

  const fetchAreas = useCallback((signal: AbortSignal) => areaService.list(signal), [])
  const fetchGoals = useCallback((signal: AbortSignal) => goalService.list(signal), [])
  const fetchOffers = useCallback(
    (signal: AbortSignal) =>
      offerService.search(
        {
          universidad: filters.universidad || undefined,
          area: filters.area || undefined,
          carrera: debouncedSearch || undefined,
        },
        signal,
      ),
    [filters.universidad, filters.area, debouncedSearch],
  )
  const areas = useFetch(fetchAreas)
  const goals = useFetch(fetchGoals)
  const offers = useFetch(fetchOffers)

  const universities = useMemo(
    () => [...new Set(areas.data?.map((area) => area.universidad))],
    [areas.data],
  )
  const universityAreas = useMemo(
    () => areas.data?.filter((area) => area.universidad === filters.universidad) ?? [],
    [areas.data, filters.universidad],
  )
  const careers = useMemo(
    () => sortCareers(offers.data ?? [], filters.sort),
    [offers.data, filters.sort],
  )
  const goalOfferIds = useMemo(
    () => new Set(goals.data?.map((goal) => goal.ofertaAcademicaId)),
    [goals.data],
  )
  const selectedOffer = careers.find((offer) => offer.id === selectedId) ?? null

  const updateParams = (changes: Record<string, string | null>, replace = false) =>
    setSearchParams(
      (params) => {
        Object.entries(changes).forEach(([key, value]) =>
          value ? params.set(key, value) : params.delete(key),
        )
        return params
      },
      { replace },
    )

  const clearFilters = () => updateParams({ q: null, universidad: null, area: null })

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
      <PageHeader
        title="Catálogo de carreras"
        description="Explora las carreras de la UNI y San Marcos, sus vacantes y el puntaje del último ingresante."
        breadcrumbs={[{ label: 'Inicio', to: paths.dashboard }, { label: 'Carreras' }]}
      />

      <CareerFilters
        values={filters}
        universities={universities}
        areas={universityAreas}
        loadingAreas={areas.loading}
        hasActiveFilters={hasActiveFilters}
        onChange={updateParams}
        onSearchChange={(search) => updateParams({ q: search }, true)}
        onClear={clearFilters}
      />

      <section aria-label="Resultados" aria-busy={offers.loading} className="space-y-4">
        {offers.loading && !offers.data ? (
          <SkeletonList rows={4} label="Cargando carreras…" />
        ) : offers.error ? (
          <InlineError message={offers.error.message} onRetry={offers.retry} />
        ) : careers.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="No encontramos carreras"
            message="Prueba con otro nombre o cambia la universidad y el área para ver más opciones."
            action={hasActiveFilters && <Button onClick={clearFilters}>Limpiar filtros</Button>}
          />
        ) : (
          <>
            <p aria-live="polite" className="text-sm text-ink-muted">
              {careers.length}{' '}
              {careers.length === 1 ? 'carrera encontrada' : 'carreras encontradas'}
            </p>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {careers.map((offer) => (
                <CareerCard
                  key={offer.id}
                  offer={offer}
                  isGoal={goalOfferIds.has(offer.id)}
                  onSelect={(selected) => updateParams({ detalle: String(selected.id) })}
                />
              ))}
            </ul>
          </>
        )}
      </section>

      <CareerDetailModal
        key={selectedOffer?.id}
        offer={selectedOffer}
        isGoal={selectedOffer ? goalOfferIds.has(selectedOffer.id) : false}
        onClose={() => updateParams({ detalle: null })}
        onAdded={goals.retry}
      />
    </main>
  )
}
