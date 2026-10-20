import { ChevronRight } from 'lucide-react'
import { generatePath, Link } from 'react-router'
import { paths } from '../../routes/paths'
import type { Question } from '../../types/question'
import { formatMath } from '../../utils/formatMath'
import { Badge } from '../ui/Badge'
import { DifficultyBadge } from './DifficultyBadge'

interface QuestionListItemProps {
  question: Question
  search: string
}

export function QuestionListItem({ question, search }: QuestionListItemProps) {
  return (
    <li>
      <Link
        to={generatePath(paths.question, { questionId: String(question.id) })}
        state={{ fromSearch: search }}
        className="group flex items-center gap-4 rounded-2xl bg-surface p-5 shadow-card ring-1 ring-transparent transition hover:-translate-y-0.5 hover:ring-accent hover:shadow-raised focus-visible:outline-2 focus-visible:outline-accent"
      >
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="brand">{question.temaNombre}</Badge>
            <DifficultyBadge difficulty={question.dificultad} />
            <span className="text-xs text-ink-muted">#{question.id}</span>
          </div>
          <p className="line-clamp-2 text-ink">{formatMath(question.enunciado)}</p>
        </div>
        <ChevronRight
          aria-hidden
          className="size-5 shrink-0 text-ink-muted transition group-hover:translate-x-1 group-hover:text-accent-ink"
        />
      </Link>
    </li>
  )
}
