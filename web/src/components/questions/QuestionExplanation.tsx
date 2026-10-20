import { Lightbulb } from 'lucide-react'
import { formatMath } from '../../utils/formatMath'

export function QuestionExplanation({ explanation }: { explanation: string | null }) {
  return (
    <div className="space-y-2 rounded-xl bg-surface-muted p-4">
      <p className="flex items-center gap-2 text-sm font-semibold">
        <Lightbulb aria-hidden className="size-4 text-warning" />
        Explicación
      </p>
      {explanation ? (
        <p className="leading-relaxed whitespace-pre-line">{formatMath(explanation)}</p>
      ) : (
        <p className="text-sm text-ink-muted">Esta pregunta todavía no tiene explicación.</p>
      )}
    </div>
  )
}
