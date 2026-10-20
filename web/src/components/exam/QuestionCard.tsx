import type { ExamQuestion } from '../../types/exam'
import { alternativeLetter } from '../../utils/format'
import { formatMath } from '../../utils/formatMath'

interface QuestionCardProps {
  question: ExamQuestion
  position: number
  selected: number | null
  onSelect: (alternative: number) => void
}

export function QuestionCard({ question, position, selected, onSelect }: QuestionCardProps) {
  return (
    <fieldset className="space-y-4 rounded-2xl bg-surface p-6 shadow-card">
      <legend className="sr-only">Pregunta {position}</legend>
      <span className="inline-flex rounded-full bg-chip px-3 py-1 text-sm font-semibold text-primary">
        {question.tema}
      </span>
      <p className="text-lg whitespace-pre-line">{formatMath(question.enunciado)}</p>
      <div className="space-y-2">
        {question.alternativas.map((text, alternative) => (
          <label
            key={alternative}
            className="flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border-2 border-line bg-surface px-4 py-3 transition hover:bg-surface-muted has-checked:border-accent has-checked:bg-accent-soft has-focus-visible:ring-2 has-focus-visible:ring-accent"
          >
            <input
              type="radio"
              name={`question-${question.preguntaId}`}
              checked={selected === alternative}
              onChange={() => onSelect(alternative)}
              className="peer sr-only"
            />
            <span
              aria-hidden
              className="flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-ink-muted text-sm font-semibold peer-checked:border-accent peer-checked:bg-accent peer-checked:text-on-accent"
            >
              {alternativeLetter(alternative)}
            </span>
            <span>{formatMath(text)}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
