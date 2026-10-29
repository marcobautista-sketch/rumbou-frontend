import { FilterX, Search } from 'lucide-react'
import type { Area, Topic } from '../../types/exam'
import { difficulties, difficultyLabels, questionSortOptions } from '../../utils/questionLabels'
import { Button } from '../ui/Button'
import { SelectField } from '../ui/SelectField'
import { TextField } from '../ui/TextField'

export interface QuestionFilterValues {
  search: string
  area: string
  topic: string
  difficulty: string
  status: string
  sort: string
}

interface QuestionFiltersProps {
  values: QuestionFilterValues
  areas: Area[]
  topics: Topic[]
  loadingTopics: boolean
  showStatus: boolean
  hasActiveFilters: boolean
  onChange: (changes: Record<string, string>) => void
  onSearchChange: (search: string) => void
  onClear: () => void
}

export function QuestionFilters({
  values,
  areas,
  topics,
  loadingTopics,
  showStatus,
  hasActiveFilters,
  onChange,
  onSearchChange,
  onClear,
}: QuestionFiltersProps) {
  return (
    <div className="space-y-4 rounded-2xl bg-surface p-4 shadow-card">
      <div className="relative">
        <TextField
          label="Buscar en el enunciado"
          type="search"
          autoComplete="off"
          placeholder="Ej.: triángulo, porcentaje, fotosíntesis"
          value={values.search}
          onChange={(event) => onSearchChange(event.target.value)}
          className="[&_input]:pl-10"
        />
        <Search
          aria-hidden
          className="pointer-events-none absolute top-[2.15rem] left-3 size-5 text-ink-muted"
        />
      </div>

      <div
        className={`grid gap-4 sm:grid-cols-2 ${showStatus ? 'lg:grid-cols-5' : 'lg:grid-cols-4'}`}
      >
        <SelectField
          label="Universidad y área"
          value={values.area}
          onChange={(event) => onChange({ area: event.target.value, topic: '' })}
        >
          <option value="">Todas</option>
          {areas.map((area) => (
            <option key={area.id} value={area.id}>
              {area.universidad} · {area.nombre}
            </option>
          ))}
        </SelectField>

        <SelectField
          label="Tema"
          value={values.topic}
          disabled={!values.area || loadingTopics}
          title={values.area ? undefined : 'Primero elige una universidad y área'}
          onChange={(event) => onChange({ topic: event.target.value })}
        >
          <option value="">{values.area ? 'Todos' : 'Elige un área primero'}</option>
          {topics.map((topic) => (
            <option key={topic.id} value={topic.id}>
              {topic.nombre}
            </option>
          ))}
        </SelectField>

        <SelectField
          label="Dificultad"
          value={values.difficulty}
          onChange={(event) => onChange({ difficulty: event.target.value })}
        >
          <option value="">Todas</option>
          {difficulties.map((difficulty) => (
            <option key={difficulty} value={difficulty}>
              {difficultyLabels[difficulty]}
            </option>
          ))}
        </SelectField>

        {showStatus && (
          <SelectField
            label="Estado"
            value={values.status}
            onChange={(event) => onChange({ status: event.target.value })}
          >
            <option value="">Todas</option>
            <option value="approved">Aprobadas</option>
            <option value="pending">Pendientes de revisión</option>
          </SelectField>
        )}

        <SelectField
          label="Ordenar por"
          value={values.sort}
          onChange={(event) => onChange({ sort: event.target.value })}
        >
          {questionSortOptions.map((option) => (
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
