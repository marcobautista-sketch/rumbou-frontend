import { CheckCheck, Eye, PartyPopper } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { questionService } from '../../api/questionService'
import { InlineError } from '../../components/feedback/InlineError'
import { PageHeader } from '../../components/layout/PageHeader'
import { DifficultyBadge } from '../../components/questions/DifficultyBadge'
import { QuestionPreviewModal } from '../../components/review/QuestionPreviewModal'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { EmptyState } from '../../components/ui/EmptyState'
import { Pagination } from '../../components/ui/Pagination'
import { SkeletonList } from '../../components/ui/Skeleton'
import { Table, type TableColumn } from '../../components/ui/Table'
import { useFetch } from '../../hooks/useFetch'
import { usePagination } from '../../hooks/usePagination'
import type { Question } from '../../types/question'
import { notify } from '../../utils/notify'

export default function ReviewPage() {
  const { page, size, apiParams, setPage, setSize } = usePagination()
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [previewQuestion, setPreviewQuestion] = useState<Question | null>(null)
  const [approvingId, setApprovingId] = useState<number | null>(null)
  const [confirmingBatch, setConfirmingBatch] = useState(false)
  const [approvingBatch, setApprovingBatch] = useState(false)

  const fetchPending = useCallback(
    (signal: AbortSignal) =>
      questionService.list({ ...apiParams, aprobada: false, sort: 'id,asc' }, signal),
    [apiParams],
  )
  const pending = useFetch(fetchPending)
  const rows = useMemo(() => pending.data?.content ?? [], [pending.data])

  const selectedOnPage = useMemo(
    () => rows.filter((question) => selectedIds.has(question.id)).map((question) => question.id),
    [rows, selectedIds],
  )
  const allSelected = rows.length > 0 && selectedOnPage.length === rows.length
  const busy = approvingId !== null || approvingBatch

  const toggle = (questionId: number) =>
    setSelectedIds((current) => {
      const next = new Set(current)
      if (next.has(questionId)) next.delete(questionId)
      else next.add(questionId)
      return next
    })

  const toggleAll = () =>
    setSelectedIds(allSelected ? new Set() : new Set(rows.map((question) => question.id)))

  const afterApproval = (approvedIds: number[]) => {
    setSelectedIds((current) => {
      const next = new Set(current)
      approvedIds.forEach((approvedId) => next.delete(approvedId))
      return next
    })
    if (rows.length === approvedIds.length && page > 1) setPage(page - 1)
    else pending.retry()
  }

  const approveOne = async (question: Question) => {
    setApprovingId(question.id)
    try {
      await questionService.approve(question.id)
      notify.success(`Pregunta #${question.id} aprobada`)
      setPreviewQuestion(null)
      afterApproval([question.id])
    } catch (error) {
      notify.error(error)
    } finally {
      setApprovingId(null)
    }
  }

  const approveSelected = async () => {
    setApprovingBatch(true)
    try {
      const approved = await questionService.approveBatch(selectedOnPage)
      notify.success(
        approved.length === 1 ? '1 pregunta aprobada' : `${approved.length} preguntas aprobadas`,
      )
      afterApproval(selectedOnPage)
    } catch (error) {
      notify.error(error)
    } finally {
      setApprovingBatch(false)
      setConfirmingBatch(false)
    }
  }

  const columns: TableColumn<Question>[] = [
    {
      key: 'select',
      header: (
        <input
          type="checkbox"
          checked={allSelected}
          onChange={toggleAll}
          disabled={busy || rows.length === 0}
          aria-label="Seleccionar todas las preguntas de esta página"
          className="size-4 accent-indigo-600"
        />
      ),
      className: 'w-10',
      render: (question) => (
        <input
          type="checkbox"
          checked={selectedIds.has(question.id)}
          onChange={() => toggle(question.id)}
          disabled={busy}
          aria-label={`Seleccionar la pregunta ${question.id}`}
          className="size-4 accent-indigo-600"
        />
      ),
    },
    {
      key: 'question',
      header: 'Pregunta',
      render: (question) => (
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="indigo">{question.temaNombre}</Badge>
            <DifficultyBadge difficulty={question.dificultad} />
            <span className="text-xs text-slate-400">#{question.id}</span>
          </div>
          <p className="line-clamp-2 max-w-xl text-slate-700 dark:text-slate-300">
            {question.enunciado}
          </p>
        </div>
      ),
    },
    {
      key: 'actions',
      header: <span className="sr-only">Acciones</span>,
      className: 'text-right whitespace-nowrap',
      render: (question) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPreviewQuestion(question)}
            disabled={busy}
            aria-label={`Ver la pregunta ${question.id}`}
          >
            <Eye aria-hidden className="size-4" />
            <span className="hidden sm:inline">Ver</span>
          </Button>
          <Button
            variant="secondary"
            size="sm"
            loading={approvingId === question.id}
            disabled={busy}
            onClick={() => approveOne(question)}
          >
            Aprobar
          </Button>
        </div>
      ),
    },
  ]

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
      <PageHeader
        title="Revisión de preguntas"
        description="Las preguntas generadas con IA esperan aquí hasta que un revisor las apruebe."
        breadcrumbs={[{ label: 'Revisión' }]}
        actions={
          <Button
            onClick={() => setConfirmingBatch(true)}
            disabled={selectedOnPage.length === 0 || busy}
          >
            <CheckCheck aria-hidden className="size-4" />
            Aprobar seleccionadas
            {selectedOnPage.length > 0 && ` (${selectedOnPage.length})`}
          </Button>
        }
      />

      <section aria-label="Preguntas pendientes" aria-busy={pending.loading} className="space-y-6">
        {pending.loading ? (
          <SkeletonList rows={4} label="Cargando preguntas pendientes…" />
        ) : pending.error ? (
          <InlineError message={pending.error.message} onRetry={pending.retry} />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={PartyPopper}
            title="¡Todo al día!"
            message="No hay preguntas pendientes de revisión. Vuelve más tarde."
          />
        ) : (
          <>
            <Table
              caption="Preguntas pendientes de revisión"
              columns={columns}
              rows={rows}
              rowKey={(question) => question.id}
              isRowSelected={(question) => selectedIds.has(question.id)}
            />
            {pending.data && (
              <Pagination
                page={page}
                size={size}
                totalElements={pending.data.totalElements}
                totalPages={pending.data.totalPages}
                itemLabel="pendientes"
                onPageChange={setPage}
                onSizeChange={setSize}
              />
            )}
          </>
        )}
      </section>

      <QuestionPreviewModal
        question={previewQuestion}
        approving={previewQuestion !== null && approvingId === previewQuestion.id}
        onApprove={approveOne}
        onClose={() => setPreviewQuestion(null)}
      />

      <ConfirmDialog
        open={confirmingBatch}
        title={`¿Aprobar ${selectedOnPage.length} ${selectedOnPage.length === 1 ? 'pregunta' : 'preguntas'}?`}
        message="Desde ahora podrán aparecer en los simulacros de todos los postulantes."
        confirmLabel="Sí, aprobar"
        loading={approvingBatch}
        onConfirm={approveSelected}
        onCancel={() => setConfirmingBatch(false)}
      />
    </main>
  )
}
