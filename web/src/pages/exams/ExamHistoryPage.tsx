import { NotebookPen, Plus } from 'lucide-react'
import { useCallback, useMemo } from 'react'
import { generatePath, Link } from 'react-router'
import { areaService } from '../../api/areaService'
import { examService } from '../../api/examService'
import { InlineError } from '../../components/feedback/InlineError'
import { Page } from '../../components/layout/Page'
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
import type { Area, ExamSummary } from '../../types/exam'
import { examTypeLabels } from '../../utils/examSummary'
import { formatLongDate, formatScore } from '../../utils/format'
import { scoringFor } from '../../utils/scoringRules'
import { areaLabel } from '../../utils/universityLabels'

// El puntaje de un simulacro completo se lee sobre el máximo de su universidad; el de uno por
// tema es solo de ese tema.
function scoreText(exam: ExamSummary, area: Area | undefined) {
  if (exam.puntajeObtenido === null) return '—'
  const max = scoringFor(area?.universidad)?.maxScore
  if (exam.tipo === 'POR_TEMA' || !max) return `${formatScore(exam.puntajeObtenido)} pts`
  return `${formatScore(exam.puntajeObtenido)} / ${formatScore(max)}`
}

function ExamStatus({ exam }: { exam: ExamSummary }) {
  return exam.estado === 'FINALIZADO' ? (
    <Badge tone="neutral">Terminado</Badge>
  ) : (
    <Badge tone="warning">En curso</Badge>
  )
}

function ExamLink({ exam }: { exam: ExamSummary }) {
  const finished = exam.estado === 'FINALIZADO'
  const to = generatePath(finished ? paths.examResult : paths.exam, { examId: String(exam.id) })
  return (
    <Link to={to} className={buttonStyles(finished ? 'secondary' : 'primary', 'sm')}>
      {finished ? 'Ver resultado' : 'Continuar'}
    </Link>
  )
}

// En celulares cada simulacro es una tarjeta: en una tabla, el puntaje y el botón quedarían
// fuera de la pantalla.
function ExamCard({ exam, area }: { exam: ExamSummary; area: Area | undefined }) {
  return (
    <li className="space-y-3 rounded-2xl bg-surface p-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-ink">{examTypeLabels[exam.tipo]}</p>
          <p className="text-sm text-ink-muted">
            {area ? areaLabel(area.universidad, area.nombre) : exam.area}
          </p>
          <p className="text-sm text-ink-muted">
            {formatLongDate(exam.fechaFin ?? exam.fechaInicio)}
          </p>
        </div>
        <ExamStatus exam={exam} />
      </div>
      <div className="flex items-center justify-end gap-3">
        {exam.puntajeObtenido !== null && (
          <p className="mr-auto font-display text-lg font-bold text-primary tabular-nums">
            {scoreText(exam, area)}
          </p>
        )}
        <ExamLink exam={exam} />
      </div>
    </li>
  )
}

export default function ExamHistoryPage() {
  const { page, size, apiParams, setPage, setSize } = usePagination()
  const fetchExams = useCallback(
    (signal: AbortSignal) => examService.list(apiParams, signal),
    [apiParams],
  )
  const fetchAreas = useCallback((signal: AbortSignal) => areaService.list(signal), [])
  const exams = useFetch(fetchExams)
  const areas = useFetch(fetchAreas)
  const result = exams.data

  const areaOf = useCallback(
    (exam: ExamSummary) => areas.data?.find((area) => area.id === exam.areaId),
    [areas.data],
  )

  const columns = useMemo<TableColumn<ExamSummary>[]>(
    () => [
      {
        key: 'exam',
        header: 'Simulacro',
        render: (exam) => {
          const area = areaOf(exam)
          return (
            <div className="space-y-0.5">
              <p className="font-semibold text-ink">{examTypeLabels[exam.tipo]}</p>
              <p className="text-ink-muted">
                {area ? areaLabel(area.universidad, area.nombre) : exam.area}
              </p>
            </div>
          )
        },
      },
      {
        key: 'date',
        header: 'Fecha',
        className: 'whitespace-nowrap',
        render: (exam) => formatLongDate(exam.fechaFin ?? exam.fechaInicio),
      },
      {
        key: 'status',
        header: 'Estado',
        render: (exam) => <ExamStatus exam={exam} />,
      },
      {
        key: 'score',
        header: 'Puntaje',
        className: 'text-right whitespace-nowrap tabular-nums',
        render: (exam) => scoreText(exam, areaOf(exam)),
      },
      {
        key: 'actions',
        header: <span className="sr-only">Acciones</span>,
        className: 'text-right whitespace-nowrap',
        render: (exam) => <ExamLink exam={exam} />,
      },
    ],
    [areaOf],
  )

  return (
    <Page>
      <PageHeader
        title="Simulacros"
        description="Retoma los que dejaste a medias y revisa el resultado de los que terminaste."
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
                : 'Empieza con tu diagnóstico: mide tu punto de partida en cada tema del examen.'
            }
            action={
              page > 1 ? (
                <Button onClick={() => setPage(1)}>Ir a la primera página</Button>
              ) : (
                <Link to={`${paths.newExam}?tipo=DIAGNOSTICO`} className={buttonStyles('primary')}>
                  Rendir mi diagnóstico
                </Link>
              )
            }
          />
        ) : (
          <>
            <ul className="space-y-3 md:hidden">
              {result.content.map((exam) => (
                <ExamCard key={exam.id} exam={exam} area={areaOf(exam)} />
              ))}
            </ul>
            <div className="hidden md:block">
              <Table
                caption="Historial de simulacros"
                columns={columns}
                rows={result.content}
                rowKey={(exam) => exam.id}
              />
            </div>
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
    </Page>
  )
}
