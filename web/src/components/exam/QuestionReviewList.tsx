import { ChevronDown, CircleCheck, CircleSlash, CircleX } from 'lucide-react'
import { useState } from 'react'
import type { ExamQuestion } from '../../types/exam'
import { formatMath } from '../../utils/formatMath'
import { TutorPanel } from '../questions/TutorPanel'
import { SolutionReviewPanel } from '../solution/SolutionReviewPanel'
import { AnswerReview } from './AnswerReview'

function statusOf(question: ExamQuestion) {
  if (question.esCorrecta) return { label: 'Correcta', Icon: CircleCheck, color: 'text-success' }
  if (question.alternativaMarcada === null) {
    return { label: 'En blanco', Icon: CircleSlash, color: 'text-ink-muted' }
  }
  return { label: 'Incorrecta', Icon: CircleX, color: 'text-danger' }
}

function ReviewItem({ question, number }: { question: ExamQuestion; number: number }) {
  // El contenido se monta al abrir: un simulacro completo tiene decenas de preguntas.
  const [open, setOpen] = useState(false)
  const status = statusOf(question)

  return (
    <details
      onToggle={(event) => setOpen(event.currentTarget.open)}
      className="group rounded-2xl bg-surface shadow-card"
    >
      <summary className="flex cursor-pointer list-none items-center gap-3 rounded-2xl p-4 focus-visible:outline-2 focus-visible:outline-accent">
        <status.Icon aria-hidden className={`size-5 shrink-0 ${status.color}`} />
        <span className="flex-1 font-medium">
          Pregunta {number} · {question.tema}
        </span>
        <span className={`text-sm font-semibold ${status.color}`}>{status.label}</span>
        <ChevronDown aria-hidden className="size-4 transition group-open:rotate-180" />
      </summary>
      {open && (
        <div className="space-y-4 border-t border-line p-4">
          <p className="whitespace-pre-line">{formatMath(question.enunciado)}</p>
          {question.claveCorrecta !== null && (
            <AnswerReview
              alternatives={question.alternativas}
              correct={question.claveCorrecta}
              marked={question.alternativaMarcada}
            />
          )}
          {question.explicacion && (
            <div className="rounded-xl bg-surface-muted p-4">
              <p className="mb-1 font-semibold">Explicación</p>
              <p className="whitespace-pre-line text-ink-muted">
                {formatMath(question.explicacion)}
              </p>
            </div>
          )}
          {!question.esCorrecta && (
            <>
              <TutorPanel
                questionId={question.preguntaId}
                markedAlternative={question.alternativaMarcada}
              />
              <SolutionReviewPanel
                questionId={question.preguntaId}
                statement={question.enunciado}
              />
            </>
          )}
        </div>
      )}
    </details>
  )
}

export function QuestionReviewList({ questions }: { questions: ExamQuestion[] }) {
  const [onlyMistakes, setOnlyMistakes] = useState(false)
  const numbered = questions.map((question, index) => ({ question, number: index + 1 }))
  const visible = onlyMistakes ? numbered.filter(({ question }) => !question.esCorrecta) : numbered

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={onlyMistakes}
          onChange={(event) => setOnlyMistakes(event.target.checked)}
          className="size-4 accent-accent"
        />
        Mostrar solo las incorrectas y en blanco
      </label>
      <ol className="space-y-3">
        {visible.map(({ question, number }) => (
          <li key={question.respuestaUsuarioId}>
            <ReviewItem question={question} number={number} />
          </li>
        ))}
      </ol>
    </div>
  )
}
