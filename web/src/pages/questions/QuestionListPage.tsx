import { Plus, SearchX } from 'lucide-react'
import { useCallback } from 'react'
import { Link } from 'react-router'
import { questionService } from '../../api/questionService'
import { InlineError } from '../../components/feedback/InlineError'
import { PageHeader } from '../../components/layout/PageHeader'
import {
  QuestionFilters,
  type QuestionFilterValues,
} from '../../components/questions/QuestionFilters'
import { QuestionListItem } from '../../components/questions/QuestionListItem'
import { Button } from '../../components/ui/Button'
import { buttonStyles } from '../../components/ui/buttonStyles'
import { EmptyState } from '../../components/ui/EmptyState'
import { Pagination } from '../../components/ui/Pagination'
import { SkeletonList } from '../../components/ui/Skeleton'
import { useAreaTopics } from '../../hooks/useAreaTopics'
import { useAuth } from '../../hooks/useAuth'
import { useFetch } from '../../hooks/useFetch'
import { usePagination } from '../../hooks/usePagination'
import { paths } from '../../routes/paths'
import { DEFAULT_QUESTION_SORT, isDifficulty } from '../../utils/questionLabels'

const statusToApproved: Record<string, boolean | undefined> = {
  approved: true,
  pending: false,
}

export default function QuestionListPage() {
  const { hasRole } = useAuth()
  const canReview = hasRole('REVIEWER', 'ADMIN')
  const isAdmin = hasRole('ADMIN')
  const { page, size, searchParams, apiParams, setPage, setSize, setFilters } = usePagination()

  const filters: QuestionFilterValues = {
    area: searchParams.get('area') ?? '',
    topic: searchParams.get('topic') ?? '',
    difficulty: searchParams.get('difficulty') ?? '',
    status: searchParams.get('status') ?? '',
    sort: searchParams.get('sort') ?? DEFAULT_QUESTION_SORT,
  }
  const hasActiveFilters = Boolean(
    filters.area || filters.topic || filters.difficulty || filters.status,
  )

  const { areas, topics } = useAreaTopics(filters.area ? Number(filters.area) : null)

  const fetchQuestions = useCallback(
    (signal: AbortSignal) =>
      questionService.list(
        {
          ...apiParams,
          sort: filters.sort,
          temaId: filters.topic ? Number(filters.topic) : undefined,
          dificultad: isDifficulty(filters.difficulty) ? filters.difficulty : undefined,
          aprobada: canReview ? statusToApproved[filters.status] : undefined,
        },
        signal,
      ),
    [apiParams, filters.sort, filters.topic, filters.difficulty, filters.status, canReview],
  )
  const questions = useFetch(fetchQuestions)
  const result = questions.data

  const clearFilters = () =>
    setFilters({ area: null, topic: null, difficulty: null, status: null, sort: null })

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
      <PageHeader
        title="Banco de preguntas"
        description="Practica con preguntas reales de admisión, ordenadas por tema y dificultad."
        breadcrumbs={[{ label: 'Banco de preguntas' }]}
        actions={
          isAdmin && (
            <Link to={paths.newQuestion} className={buttonStyles('primary')}>
              <Plus aria-hidden className="size-4" />
              Nueva pregunta
            </Link>
          )
        }
      />

      <QuestionFilters
        values={filters}
        areas={areas.data ?? []}
        topics={topics.data ?? []}
        loadingTopics={topics.loading}
        showStatus={canReview}
        hasActiveFilters={hasActiveFilters}
        onChange={setFilters}
        onClear={clearFilters}
      />

      <section aria-label="Resultados" aria-busy={questions.loading} className="space-y-6">
        {questions.loading ? (
          <SkeletonList rows={Math.min(size, 5)} label="Cargando preguntas…" />
        ) : questions.error ? (
          <InlineError message={questions.error.message} onRetry={questions.retry} />
        ) : !result || result.content.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title={page > 1 ? 'Esta página está vacía' : 'No encontramos preguntas'}
            message={
              page > 1
                ? 'La página que buscas ya no tiene resultados.'
                : 'Prueba con otro tema o dificultad, o limpia los filtros para ver todo el banco.'
            }
            action={
              page > 1 ? (
                <Button onClick={() => setPage(1)}>Ir a la primera página</Button>
              ) : (
                hasActiveFilters && <Button onClick={clearFilters}>Limpiar filtros</Button>
              )
            }
          />
        ) : (
          <>
            <ul className="space-y-3">
              {result.content.map((question) => (
                <QuestionListItem
                  key={question.id}
                  question={question}
                  search={searchParams.toString()}
                />
              ))}
            </ul>
            <Pagination
              page={page}
              size={size}
              totalElements={result.totalElements}
              totalPages={result.totalPages}
              itemLabel="preguntas"
              onPageChange={setPage}
              onSizeChange={setSize}
            />
          </>
        )}
      </section>
    </main>
  )
}
