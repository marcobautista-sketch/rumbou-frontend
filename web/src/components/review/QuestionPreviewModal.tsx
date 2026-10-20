import { useCallback } from 'react'
import { questionService } from '../../api/questionService'
import { useFetch } from '../../hooks/useFetch'
import type { AdminQuestion, Question } from '../../types/question'
import { formatMath } from '../../utils/formatMath'
import { InlineError } from '../feedback/InlineError'
import { AlternativeList } from '../questions/AlternativeList'
import { DifficultyBadge } from '../questions/DifficultyBadge'
import { QuestionExplanation } from '../questions/QuestionExplanation'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'
import { Skeleton } from '../ui/Skeleton'

interface QuestionPreviewModalProps {
  question: Question | null
  approving: boolean
  onApprove: (question: Question) => void
  onClose: () => void
}

export function QuestionPreviewModal({
  question,
  approving,
  onApprove,
  onClose,
}: QuestionPreviewModalProps) {
  const questionId = question?.id
  const fetchComplete = useCallback(
    (signal: AbortSignal): Promise<AdminQuestion | null> =>
      questionId ? questionService.getComplete(questionId, signal) : Promise.resolve(null),
    [questionId],
  )
  const complete = useFetch(fetchComplete)
  const detail = complete.data

  return (
    <Modal
      open={question !== null}
      title={question ? `Pregunta #${question.id}` : ''}
      size="lg"
      dismissible={!approving}
      onClose={onClose}
      footer={
        question && (
          <>
            <Button variant="secondary" onClick={onClose} disabled={approving}>
              Cerrar
            </Button>
            <Button
              loading={approving}
              disabled={complete.loading}
              onClick={() => onApprove(question)}
            >
              Aprobar
            </Button>
          </>
        )
      }
    >
      {question && (
        <div className="max-h-[60vh] space-y-4 overflow-y-auto">
          <div className="flex flex-wrap gap-2">
            <Badge tone="brand">{question.temaNombre}</Badge>
            <DifficultyBadge difficulty={question.dificultad} />
          </div>
          <p className="leading-relaxed whitespace-pre-line">{formatMath(question.enunciado)}</p>
          {complete.loading ? (
            <div role="status" aria-label="Cargando la respuesta…" className="space-y-2">
              {Array.from({ length: 5 }, (_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          ) : complete.error || !detail ? (
            <>
              <AlternativeList alternatives={question.alternativas} />
              <InlineError
                message={complete.error?.message ?? 'No pudimos cargar la respuesta.'}
                onRetry={complete.retry}
              />
            </>
          ) : (
            <>
              <AlternativeList
                alternatives={detail.alternativas}
                correctIndex={detail.claveCorrecta}
              />
              <QuestionExplanation explanation={detail.explicacion} />
            </>
          )}
        </div>
      )}
    </Modal>
  )
}
