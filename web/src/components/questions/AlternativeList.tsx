import { CircleCheck } from 'lucide-react'
import { alternativeLetter } from '../../utils/format'

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
              isCorrect
                ? 'border-emerald-400 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/50'
                : 'border-slate-200 dark:border-slate-700'
            }`}
          >
            <span
              className={`flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                isCorrect
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {alternativeLetter(index)}
            </span>
            <span className="flex-1 pt-0.5">{text.replace(/^[A-E]\)\s*/, '')}</span>
            {isCorrect && (
              <CircleCheck
                aria-label="Respuesta correcta"
                className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400"
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}
