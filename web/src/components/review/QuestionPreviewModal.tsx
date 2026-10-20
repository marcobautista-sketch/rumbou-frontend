import type { Question } from '../../types/question'
import { formatMath } from '../../utils/formatMath'
import { AlternativeList } from '../questions/AlternativeList'
import { DifficultyBadge } from '../questions/DifficultyBadge'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'

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
            <Button loading={approving} onClick={() => onApprove(question)}>
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
          <AlternativeList alternatives={question.alternativas} />
        </div>
      )}
    </Modal>
  )
}
