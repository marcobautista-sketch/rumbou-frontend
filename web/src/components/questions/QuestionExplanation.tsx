import { Lightbulb, ListOrdered } from 'lucide-react'
import type { SolutionStep } from '../../types/presentation'
import { MathText } from './MathText'
import { SolutionSteps } from './SolutionSteps'

interface QuestionExplanationProps {
  explanation: string | null
  // La misma explicación ordenada en pasos; si existe, se muestra en lugar del párrafo.
  steps?: SolutionStep[] | null
}

export function QuestionExplanation({ explanation, steps }: QuestionExplanationProps) {
  if (steps?.length) {
    return (
      <div className="space-y-3 rounded-xl bg-surface-muted p-4">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <ListOrdered aria-hidden className="size-4 text-accent-ink" />
          Resolución
        </p>
        <SolutionSteps steps={steps} />
      </div>
    )
  }

  return (
    <div className="space-y-2 rounded-xl bg-surface-muted p-4">
      <p className="flex items-center gap-2 text-sm font-semibold">
        <Lightbulb aria-hidden className="size-4 text-warning" />
        Explicación
      </p>
      {explanation ? (
        <p className="leading-relaxed">
          <MathText fallback={explanation} />
        </p>
      ) : (
        <p className="text-sm text-ink-muted">Esta pregunta todavía no tiene explicación.</p>
      )}
    </div>
  )
}
