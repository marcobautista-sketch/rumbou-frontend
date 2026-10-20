import type { ExamQuestion } from '../../types/exam'
import { alternativeLetter } from '../../utils/format'

interface QuestionCardProps {
  question: ExamQuestion
  position: number
  selected: number | null
  onSelect: (alternative: number) => void
}

export function QuestionCard({ question, position, selected, onSelect }: QuestionCardProps) {
  return (
    <fieldset className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <legend className="sr-only">Pregunta {position}</legend>
      <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">{question.tema}</p>
      <p className="text-lg whitespace-pre-line">{question.enunciado}</p>
      <div className="space-y-2">
        {question.alternativas.map((text, alternative) => (
          <label
            key={alternative}
            className={`flex cursor-pointer gap-3 rounded-xl border p-3 transition ${
              selected === alternative
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950'
                : 'border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800'
            }`}
          >
            <input
              type="radio"
              name={`question-${question.preguntaId}`}
              checked={selected === alternative}
              onChange={() => onSelect(alternative)}
              className="mt-1 accent-indigo-600"
            />
            <span>
              <strong>{alternativeLetter(alternative)})</strong> {text}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
