import { FilterX, Search } from 'lucide-react'
import type { Area } from '../../types/exam'
import { careerSortOptions, type CareerSort } from '../../utils/careerLabels'
import { universityNames } from '../../utils/universityLabels'
import { Button } from '../ui/Button'
import { SelectField } from '../ui/SelectField'
import { TextField } from '../ui/TextField'

export interface CareerFilterValues {
  search: string
  universidad: string
  area: string
  sort: CareerSort
}

interface CareerFiltersProps {
  values: CareerFilterValues
  universities: string[]
  areas: Area[]
  loadingAreas: boolean
  hasActiveFilters: boolean
  onChange: (changes: Record<string, string>) => void
  onSearchChange: (search: string) => void
  onClear: () => void
}

export function CareerFilters({
  values,
  universities,
  areas,
  loadingAreas,
  hasActiveFilters,
  onChange,
  onSearchChange,
  onClear,
}: CareerFiltersProps) {
  return (
    <div className="space-y-4 rounded-2xl bg-surface p-4 shadow-card">
      <div className="relative">
        <TextField
          label="Buscar carrera"
          type="search"
          autoComplete="off"
          placeholder="Ej.: Medicina, Sistemas, Arquitectura"
          value={values.search}
          onChange={(event) => onSearchChange(event.target.value)}
          className="[&_input]:pl-10"
        />
        <Search
          aria-hidden
          className="pointer-events-none absolute top-[2.15rem] left-3 size-5 text-ink-muted"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <SelectField
          label="Universidad"
          value={values.universidad}
          disabled={loadingAreas}
          onChange={(event) => onChange({ universidad: event.target.value, area: '' })}
        >
          <option value="">Todas</option>
          {universities.map((siglas) => (
            <option key={siglas} value={siglas}>
              {universityNames[siglas] ?? siglas}
            </option>
          ))}
        </SelectField>

        <SelectField
          label="Área"
          value={values.area}
          disabled={!values.universidad || loadingAreas}
          title={values.universidad ? undefined : 'Primero elige una universidad'}
          onChange={(event) => onChange({ area: event.target.value })}
        >
          <option value="">{values.universidad ? 'Todas' : 'Elige una universidad primero'}</option>
          {areas.map((area) => (
            <option key={area.id} value={area.codigo}>
              {area.nombre}
            </option>
          ))}
        </SelectField>

        <SelectField
          label="Ordenar por"
          value={values.sort}
          onChange={(event) => onChange({ sort: event.target.value })}
        >
          {careerSortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </SelectField>
      </div>

      {hasActiveFilters && (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={onClear}>
            <FilterX aria-hidden className="size-4" />
            Limpiar filtros
          </Button>
        </div>
      )}
    </div>
  )
}
