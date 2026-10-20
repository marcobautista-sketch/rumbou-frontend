import { Check, X } from 'lucide-react'
import { alternativeLetter } from '../../utils/format'
import { formatMath } from '../../utils/formatMath'

interface AnswerReviewProps {
  alternatives: string[]
  correct: number
  marked: number | null
}

export function AnswerReview({ alternatives, correct, marked }: AnswerReviewProps) {
  return (
    <ol className="space-y-2">
      {alternatives.map((text, alternative) => {
        const isCorrect = alternative === correct
        const isWrongChoice = alternative === marked && !isCorrect

        return (
          <li
            key={alternative}
            className={`flex min-h-14 items-center gap-3 rounded-xl border-2 px-4 py-3 ${
              isCorrect
                ? 'border-success bg-success/10'
                : isWrongChoice
                  ? 'border-danger bg-danger-soft'
                  : 'border-line'
            }`}
          >
            <span
              aria-hidden
              className={`flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                isCorrect
                  ? 'bg-success text-white'
                  : isWrongChoice
                    ? 'bg-danger text-white'
                    : 'border-2 border-ink-muted'
              }`}
            >
              {isCorrect ? (
                <Check className="size-4" />
              ) : isWrongChoice ? (
                <X className="size-4" />
              ) : (
                alternativeLetter(alternative)
              )}
            </span>
            <span className={isWrongChoice ? 'line-through' : undefined}>{formatMath(text)}</span>
            {isCorrect && <span className="sr-only">(respuesta correcta)</span>}
            {isWrongChoice && <span className="sr-only">(tu respuesta)</span>}
          </li>
        )
      })}
    </ol>
  )
}
