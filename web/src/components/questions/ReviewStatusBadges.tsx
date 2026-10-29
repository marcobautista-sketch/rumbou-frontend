import { Bot, CircleCheck, Clock } from 'lucide-react'
import type { AdminQuestion } from '../../types/question'
import { originLabels } from '../../utils/questionLabels'
import { Badge } from '../ui/Badge'

export function ReviewStatusBadges({ question }: { question: AdminQuestion }) {
  return (
    <>
      {question.aprobada ? (
        <Badge tone="success">
          <CircleCheck aria-hidden className="size-3" />
          Aprobada
        </Badge>
      ) : (
        <Badge tone="warning">
          <Clock aria-hidden className="size-3" />
          Pendiente de revisión
        </Badge>
      )}
      <Badge>
        {question.origen === 'IA_APROBADA' && <Bot aria-hidden className="size-3" />}
        {originLabels[question.origen]}
      </Badge>
    </>
  )
}
