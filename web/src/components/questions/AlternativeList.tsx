import { CircleCheck } from 'lucide-react'
import { alternativeLetter } from '../../utils/format'
import { formatMath } from '../../utils/formatMath'

interface AlternativeListProps {
  alternatives: string[]
  correctIndex?: number
}

export function AlternativeList({ alternatives, correctIndex }: AlternativeListProps) {
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
            <span className="flex-1 pt-0.5">{formatMath(text.replace(/^[A-E]\)\s*/, ''))}</span>
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
