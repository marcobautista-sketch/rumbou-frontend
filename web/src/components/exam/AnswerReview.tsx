import { Check, X } from 'lucide-react'
import { alternativesLayout, formattedAlternative } from '../../utils/alternatives'
import { alternativeLetter } from '../../utils/format'
import { MathText } from '../questions/MathText'

interface AnswerReviewProps {
  alternatives: string[]
  // Las mismas alternativas con formato (LaTeX), si la pregunta lo tiene.
  formatted?: string[] | null
  correct: number
  marked: number | null
}

export function AnswerReview({ alternatives, formatted, correct, marked }: AnswerReviewProps) {
  const layout = alternativesLayout(alternatives)

  return (
    <ol className={layout}>
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
                  ? 'bg-success text-surface'
                  : isWrongChoice
                    ? 'bg-danger text-surface'
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
            <MathText
              text={formattedAlternative(formatted, alternative)}
              fallback={text}
              className={`min-w-0 break-words ${isWrongChoice ? 'line-through' : ''}`}
            />
            {isCorrect && <span className="sr-only">(respuesta correcta)</span>}
            {isWrongChoice && <span className="sr-only">(tu respuesta)</span>}
          </li>
        )
      })}
    </ol>
  )
}
