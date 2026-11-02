import type { QuestionPresentation } from '../../types/presentation'
import { MathText } from './MathText'
import { QuestionFigure } from './QuestionFigure'

interface QuestionStatementProps {
  question: { enunciado: string; presentacion?: QuestionPresentation | null }
  className?: string
}

// El enunciado con sus fórmulas y, si la pregunta la tiene, su figura debajo.
export function QuestionStatement({ question, className = '' }: QuestionStatementProps) {
  const figure = question.presentacion?.figura
  return (
    <div className="space-y-4">
      <p className={className}>
        <MathText text={question.presentacion?.enunciado} fallback={question.enunciado} />
      </p>
      {figure && <QuestionFigure figure={figure} />}
    </div>
  )
}
