import { useCallback } from 'react'
import { generatePath, useNavigate, useParams } from 'react-router'
import { questionService } from '../../api/questionService'
import { InlineError } from '../../components/feedback/InlineError'
import { PageHeader } from '../../components/layout/PageHeader'
import { QuestionForm } from '../../components/questions/QuestionForm'
import {
  emptyQuestionForm,
  toQuestionRequest,
  type QuestionFormValues,
} from '../../components/questions/questionSchema'
import { SkeletonList } from '../../components/ui/Skeleton'
import { useFetch } from '../../hooks/useFetch'
import { paths } from '../../routes/paths'
import type { Question } from '../../types/question'
import { notify } from '../../utils/notify'

function toFormValues(question: Question): QuestionFormValues {
  return {
    ...emptyQuestionForm,
    temaId: String(question.temaId),
    enunciado: question.enunciado,
    alternativas: question.alternativas,
    dificultad: question.dificultad,
  }
}

export default function QuestionFormPage() {
  const { questionId } = useParams()
  const isEditing = questionId !== undefined
  const id = Number(questionId)
  const navigate = useNavigate()

  const fetchQuestion = useCallback(
    (signal: AbortSignal): Promise<Question | null> =>
      isEditing ? questionService.getById(id, signal) : Promise.resolve(null),
    [isEditing, id],
  )
  const existing = useFetch(fetchQuestion)

  const detailPath = (savedId: number) =>
    generatePath(paths.question, { questionId: String(savedId) })

  const saveQuestion = async (values: QuestionFormValues) => {
    try {
      const request = toQuestionRequest(values)
      const saved = isEditing
        ? await questionService.update(id, request)
        : await questionService.create(request)
      notify.success(isEditing ? 'Cambios guardados' : 'Pregunta creada')
      navigate(detailPath(saved.id), { replace: true })
    } catch (error) {
      notify.error(error)
    }
  }

  const title = isEditing ? `Editar pregunta #${questionId}` : 'Nueva pregunta'

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6">
      <PageHeader
        title={title}
        description={
          isEditing
            ? 'Actualiza el contenido de la pregunta. Los cambios se ven al instante en el banco.'
            : 'Agrega una pregunta al banco. Los postulantes la verán cuando esté aprobada.'
        }
        breadcrumbs={[
          { label: 'Banco de preguntas', to: paths.questions },
          ...(isEditing ? [{ label: `Pregunta #${questionId}`, to: detailPath(id) }] : []),
          { label: isEditing ? 'Editar' : 'Nueva' },
        ]}
      />

      {existing.loading ? (
        <SkeletonList rows={2} label="Cargando pregunta…" />
      ) : existing.error ? (
        <InlineError message={existing.error.message} onRetry={existing.retry} />
      ) : (
        <QuestionForm
          defaultValues={existing.data ? toFormValues(existing.data) : emptyQuestionForm}
          currentTopic={
            existing.data
              ? { id: existing.data.temaId, nombre: existing.data.temaNombre }
              : undefined
          }
          submitLabel={isEditing ? 'Guardar cambios' : 'Crear pregunta'}
          notice={
            isEditing
              ? 'Por seguridad, la API no envía la clave ni la explicación actuales. Vuelve a marcar la alternativa correcta y revisa la explicación, el origen y el estado antes de guardar.'
              : undefined
          }
          onSubmit={saveQuestion}
          onCancel={() => navigate(isEditing ? detailPath(id) : paths.questions)}
        />
      )}
    </main>
  )
}
