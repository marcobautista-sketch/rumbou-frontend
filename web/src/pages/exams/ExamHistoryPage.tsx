import { NotebookPen, Plus } from 'lucide-react'
import { useCallback } from 'react'
import { generatePath, Link } from 'react-router'
import { examService } from '../../api/examService'
import { InlineError } from '../../components/feedback/InlineError'
import { PageHeader } from '../../components/layout/PageHeader'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { buttonStyles } from '../../components/ui/buttonStyles'
import { EmptyState } from '../../components/ui/EmptyState'
import { Pagination } from '../../components/ui/Pagination'
import { SkeletonList } from '../../components/ui/Skeleton'
import { Table, type TableColumn } from '../../components/ui/Table'
import { useFetch } from '../../hooks/useFetch'
import { usePagination } from '../../hooks/usePagination'
import { paths } from '../../routes/paths'
import type { ExamSummary } from '../../types/exam'
import { examTypeLabels } from '../../utils/examSummary'
import { formatLongDate, formatScore } from '../../utils/format'

const columns: TableColumn<ExamSummary>[] = [
  {
    key: 'exam',
    header: 'Simulacro',
    render: (exam) => (
      <div className="space-y-1">
        <p className="font-medium text-ink">{examTypeLabels[exam.tipo]}</p>
        <p className="text-ink-muted">{exam.area}</p>
      </div>
    ),
  },
  {
    key: 'date',
    header: 'Fecha',
    className: 'whitespace-nowrap',
    render: (exam) => formatLongDate(exam.fechaInicio),
  },
  {
    key: 'status',
    header: 'Estado',
    render: (exam) =>
      exam.estado === 'FINALIZADO' ? (
        <Badge tone="success">Terminado</Badge>
      ) : (
        <Badge tone="warning">En curso</Badge>
      ),
  },
  {
    key: 'score',
    header: 'Puntaje',
    className: 'text-right',
    render: (exam) => (exam.puntajeObtenido === null ? '—' : formatScore(exam.puntajeObtenido)),
  },
  {
    key: 'actions',
    header: <span className="sr-only">Acciones</span>,
    className: 'text-right whitespace-nowrap',
    render: (exam) => {
      const finished = exam.estado === 'FINALIZADO'
      const to = generatePath(finished ? paths.examResult : paths.exam, {
        examId: String(exam.id),
      })
      return (
        <Link to={to} className={buttonStyles(finished ? 'secondary' : 'primary', 'sm')}>
          {finished ? 'Ver resultado' : 'Continuar'}
        </Link>
      )
    },
  },
]

export default function ExamHistoryPage() {
  const { page, size, apiParams, setPage, setSize } = usePagination()
  const fetchExams = useCallback(
    (signal: AbortSignal) => examService.list(apiParams, signal),
    [apiParams],
  )
  const exams = useFetch(fetchExams)
  const result = exams.data

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
      <PageHeader
        title="Mis simulacros"
        description="Todos los simulacros que rendiste, del más reciente al más antiguo."
        breadcrumbs={[{ label: 'Mis simulacros' }]}
        actions={
          <Link to={paths.newExam} className={buttonStyles('primary')}>
            <Plus aria-hidden className="size-4" />
            Nuevo simulacro
          </Link>
        }
      />

      <section aria-label="Historial de simulacros" aria-busy={exams.loading} className="space-y-6">
        {exams.loading ? (
          <SkeletonList rows={Math.min(size, 5)} label="Cargando tus simulacros…" />
        ) : exams.error ? (
          <InlineError message={exams.error.message} onRetry={exams.retry} />
        ) : !result || result.content.length === 0 ? (
          <EmptyState
            icon={NotebookPen}
            title={page > 1 ? 'Esta página está vacía' : 'Aún no rindes simulacros'}
            message={
              page > 1
                ? 'La página que buscas ya no tiene resultados.'
                : 'Rinde tu primer simulacro para medir tu puntaje y ver aquí tu avance.'
            }
            action={
              page > 1 ? (
                <Button onClick={() => setPage(1)}>Ir a la primera página</Button>
              ) : (
                <Link to={paths.newExam} className={buttonStyles('primary')}>
                  Rendir mi primer simulacro
                </Link>
              )
            }
          />
        ) : (
          <>
            <Table
              caption="Historial de simulacros"
              columns={columns}
              rows={result.content}
              rowKey={(exam) => exam.id}
            />
            <Pagination
              page={page}
              size={size}
              totalElements={result.totalElements}
              totalPages={result.totalPages}
              itemLabel="simulacros"
              onPageChange={setPage}
              onSizeChange={setSize}
            />
          </>
        )}
      </section>
    </main>
  )
}
