import { CircleCheck, Clock } from 'lucide-react'
import type { AdminQuestion } from '../../types/question'
import { Badge } from '../ui/Badge'

export function ReviewStatusBadges({ question }: { question: AdminQuestion }) {
  return question.aprobada ? (
    <Badge tone="success">
      <CircleCheck aria-hidden className="size-3" />
      Aprobada
    </Badge>
  ) : (
    <Badge tone="warning">
      <Clock aria-hidden className="size-3" />
      Pendiente de revisión
    </Badge>
  )
}
