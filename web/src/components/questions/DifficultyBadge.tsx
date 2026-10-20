import { Gauge } from 'lucide-react'
import type { Difficulty } from '../../types/question'
import { difficultyLabels, difficultyTones } from '../../utils/questionLabels'
import { Badge } from '../ui/Badge'

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return (
    <Badge tone={difficultyTones[difficulty]}>
      <Gauge aria-hidden className="size-3" />
      {difficultyLabels[difficulty]}
    </Badge>
  )
}
