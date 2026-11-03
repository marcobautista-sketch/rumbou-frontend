import type { ExamQuestion } from '../../types/exam'
import { areShortAlternatives, formattedAlternative } from '../../utils/alternatives'
import { alternativeLetter } from '../../utils/format'
import { MathText } from '../questions/MathText'
import { QuestionStatement } from '../questions/QuestionStatement'

interface QuestionCardProps {
  question: Pick<
    ExamQuestion,
    'preguntaId' | 'tema' | 'enunciado' | 'alternativas' | 'presentacion'
  >
  position: number
  selected: number | null
  onSelect: (alternative: number) => void
}

export function QuestionCard({ question, position, selected, onSelect }: QuestionCardProps) {
  const short = areShortAlternatives(question.alternativas)

  return (
    <fieldset className="space-y-4 rounded-2xl bg-surface p-6 shadow-card">
      <legend className="sr-only">Pregunta {position}</legend>
      <span className="inline-flex rounded-full bg-chip px-3 py-1 text-sm font-semibold text-primary">
        {question.tema}
      </span>
      <QuestionStatement question={question} className="text-lg" />
      <div className={short ? 'grid gap-2 sm:grid-cols-3 lg:grid-cols-5' : 'space-y-2'}>
        {question.alternativas.map((text, alternative) => (
          <label
            key={alternative}
            className="flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border-2 border-line bg-surface px-4 py-3 transition hover:bg-surface-muted has-checked:border-primary has-checked:bg-chip has-focus-visible:ring-2 has-focus-visible:ring-accent"
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
              className="flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-ink-muted/60 text-sm font-semibold peer-checked:border-primary peer-checked:bg-primary peer-checked:text-on-primary"
            >
              {alternativeLetter(alternative)}
            </span>
            <MathText
              text={formattedAlternative(question.presentacion?.alternativas, alternative)}
              fallback={text}
              className="min-w-0"
            />
          </label>
        ))}
      </div>
    </fieldset>
  )
}
