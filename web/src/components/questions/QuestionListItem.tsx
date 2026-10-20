import { ChevronRight } from 'lucide-react'
import { generatePath, Link } from 'react-router'
import { paths } from '../../routes/paths'
import type { Question } from '../../types/question'
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
        className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md focus-visible:outline-2 focus-visible:outline-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-700"
      >
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="indigo">{question.temaNombre}</Badge>
            <DifficultyBadge difficulty={question.dificultad} />
            <span className="text-xs text-slate-400">#{question.id}</span>
          </div>
          <p className="line-clamp-2 text-slate-800 dark:text-slate-200">{question.enunciado}</p>
        </div>
        <ChevronRight
          aria-hidden
          className="size-5 shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-indigo-500"
        />
      </Link>
    </li>
  )
}
