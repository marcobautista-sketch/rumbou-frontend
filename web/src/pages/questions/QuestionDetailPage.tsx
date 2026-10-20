import { ArrowLeft, FileQuestion, Pencil, Trash2 } from 'lucide-react'
import { useCallback, useState } from 'react'
import { generatePath, Link, useLocation, useNavigate, useParams } from 'react-router'
import { questionService } from '../../api/questionService'
import { InlineError } from '../../components/feedback/InlineError'
import { PageHeader } from '../../components/layout/PageHeader'
import { AlternativeList } from '../../components/questions/AlternativeList'
import { DifficultyBadge } from '../../components/questions/DifficultyBadge'
import { TutorPanel } from '../../components/questions/TutorPanel'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { buttonStyles } from '../../components/ui/buttonStyles'
import { Card } from '../../components/ui/Card'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { EmptyState } from '../../components/ui/EmptyState'
import { Skeleton } from '../../components/ui/Skeleton'
import { useAuth } from '../../hooks/useAuth'
import { useFetch } from '../../hooks/useFetch'
import { paths } from '../../routes/paths'
import { notify } from '../../utils/notify'

interface DetailLocationState {
  fromSearch?: string
}

function DetailSkeleton() {
  return (
    <div role="status" aria-label="Cargando pregunta…" className="space-y-4">
      <Skeleton className="h-8 w-2/3" />
      <Card className="space-y-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-4/5" />
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} className="h-12 w-full" />
        ))}
      </Card>
    </div>
  )
}

export default function QuestionDetailPage() {
  const { questionId } = useParams()
  const id = Number(questionId)
  const navigate = useNavigate()
  const location = useLocation()
  const { hasRole } = useAuth()
  const isAdmin = hasRole('ADMIN')
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const fromSearch = (location.state as DetailLocationState | null)?.fromSearch
  const listUrl = fromSearch ? `${paths.questions}?${fromSearch}` : paths.questions

  const fetchQuestion = useCallback(
    (signal: AbortSignal) => questionService.getById(id, signal),
    [id],
  )
  const question = useFetch(fetchQuestion)

  const deleteQuestion = async () => {
    setDeleting(true)
    try {
      await questionService.remove(id)
      notify.success('Pregunta eliminada')
      navigate(listUrl, { replace: true })
    } catch (error) {
      notify.error(error)
      setDeleting(false)
      setConfirmingDelete(false)
    }
  }

  if (!Number.isInteger(id) || question.error?.kind === 'notFound') {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <EmptyState
          icon={FileQuestion}
          title="Esta pregunta no existe"
          message="Puede que la hayan eliminado o que el enlace esté incompleto."
          action={
            <Link to={paths.questions} className={buttonStyles('primary')}>
              Ir al banco de preguntas
            </Link>
          }
        />
      </main>
    )
  }

  const data = question.data

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6">
      {question.loading ? (
        <DetailSkeleton />
      ) : question.error || !data ? (
        <InlineError
          message={question.error?.message ?? 'No pudimos cargar la pregunta.'}
          onRetry={question.retry}
        />
      ) : (
        <>
          <PageHeader
            title={`Pregunta #${data.id}`}
            breadcrumbs={[
              { label: 'Banco de preguntas', to: listUrl },
              { label: `Pregunta #${data.id}` },
            ]}
            actions={
              isAdmin && (
                <>
                  <Link
                    to={generatePath(paths.editQuestion, { questionId: String(data.id) })}
                    className={buttonStyles('secondary')}
                  >
                    <Pencil aria-hidden className="size-4" />
                    Editar
                  </Link>
                  <Button variant="danger" onClick={() => setConfirmingDelete(true)}>
                    <Trash2 aria-hidden className="size-4" />
                    Eliminar
                  </Button>
                </>
              )
            }
          />

          <Card className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="indigo">{data.temaNombre}</Badge>
              <DifficultyBadge difficulty={data.dificultad} />
            </div>
            <p className="text-lg leading-relaxed whitespace-pre-line">{data.enunciado}</p>
            <AlternativeList alternatives={data.alternativas} />
          </Card>

          <TutorPanel questionId={data.id} />

          <Link to={listUrl} className={buttonStyles('ghost')}>
            <ArrowLeft aria-hidden className="size-4" />
            Volver al listado
          </Link>

          <ConfirmDialog
            open={confirmingDelete}
            title="¿Eliminar esta pregunta?"
            message="Se borrará del banco para siempre. Si ya salió en algún simulacro no se podrá eliminar; en ese caso, desapruébala desde Editar."
            confirmLabel="Sí, eliminar"
            confirmVariant="danger"
            loading={deleting}
            onConfirm={deleteQuestion}
            onCancel={() => setConfirmingDelete(false)}
          />
        </>
      )}
    </main>
  )
}
