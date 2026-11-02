import { CircleCheck } from 'lucide-react'
import { formattedAlternative } from '../../utils/alternatives'
import { alternativeLetter } from '../../utils/format'
import { MathText } from './MathText'

interface AlternativeListProps {
  alternatives: string[]
  // Las mismas alternativas con formato (LaTeX), si la pregunta lo tiene.
  formatted?: string[] | null
  correctIndex?: number
}

export function AlternativeList({ alternatives, formatted, correctIndex }: AlternativeListProps) {
  return (
    <ol className="space-y-2">
      {alternatives.map((text, index) => {
        const isCorrect = index === correctIndex
        return (
          <li
            key={index}
            className={`flex gap-3 rounded-xl border p-3 ${
              isCorrect ? 'border-success bg-success/10' : 'border-line'
            }`}
          >
            <span
              className={`flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                isCorrect ? 'bg-success text-surface' : 'bg-surface-muted text-ink'
              }`}
            >
              {alternativeLetter(index)}
            </span>
            <MathText
              text={formattedAlternative(formatted, index)}
              fallback={text.replace(/^[A-E]\)\s*/, '')}
              className="min-w-0 flex-1 pt-0.5"
            />
            {isCorrect && (
              <CircleCheck
                aria-label="Respuesta correcta"
                className="size-5 shrink-0 text-success"
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}
