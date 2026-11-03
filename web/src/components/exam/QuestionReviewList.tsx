import { ChevronDown, CircleCheck, CircleSlash, CircleX } from 'lucide-react'
import { useState } from 'react'
import type { ExamQuestion } from '../../types/exam'
import { QuestionExplanation } from '../questions/QuestionExplanation'
import { QuestionStatement } from '../questions/QuestionStatement'
import { TutorPanel } from '../questions/TutorPanel'
import { SolutionReviewPanel } from '../solution/SolutionReviewPanel'
import { AnswerReview } from './AnswerReview'

function statusOf(question: ExamQuestion) {
  if (question.esCorrecta) {
    return {
      label: 'Correcta',
      Icon: CircleCheck,
      color: 'text-success',
      cell: 'bg-success text-surface',
    }
  }
  if (question.alternativaMarcada === null) {
    return {
      label: 'En blanco',
      Icon: CircleSlash,
      color: 'text-ink-muted',
      cell: 'border border-line bg-surface text-ink-muted',
    }
  }
  return {
    label: 'Incorrecta',
    Icon: CircleX,
    color: 'text-danger',
    cell: 'bg-danger text-surface',
  }
}

const anchorOf = (number: number) => `revision-pregunta-${number}`

function ReviewItem({ question, number }: { question: ExamQuestion; number: number }) {
  // El contenido se monta al abrir: un simulacro completo tiene decenas de preguntas.
  const [open, setOpen] = useState(false)
  const status = statusOf(question)

  return (
    <details
      id={anchorOf(number)}
      onToggle={(event) => setOpen(event.currentTarget.open)}
      className="group scroll-mt-6 rounded-2xl bg-surface shadow-card"
    >
      <summary className="flex cursor-pointer list-none items-center gap-3 rounded-2xl p-4 focus-visible:outline-2 focus-visible:outline-accent">
        <status.Icon aria-hidden className={`size-5 shrink-0 ${status.color}`} />
        <span className="flex-1 font-medium">
          Pregunta {number} <span className="text-ink-muted">· {question.tema}</span>
        </span>
        <span className={`text-sm font-semibold ${status.color}`}>{status.label}</span>
        <ChevronDown aria-hidden className="size-4 transition group-open:rotate-180" />
      </summary>
      {open && (
        <div className="space-y-4 border-t border-line p-4 sm:p-6">
          <QuestionStatement question={question} className="text-lg" />
          {question.claveCorrecta !== null && (
            <AnswerReview
              alternatives={question.alternativas}
              formatted={question.presentacion?.alternativas}
              correct={question.claveCorrecta}
              marked={question.alternativaMarcada}
            />
          )}
          {(question.explicacion || question.pasos) && (
            <QuestionExplanation explanation={question.explicacion} steps={question.pasos} />
          )}
          {!question.esCorrecta && (
            <>
              <TutorPanel
                questionId={question.preguntaId}
                markedAlternative={question.alternativaMarcada}
              />
              <SolutionReviewPanel questionId={question.preguntaId} />
            </>
          )}
        </div>
      )}
    </details>
  )
}

// La hoja de respuestas corregida y, debajo, cada pregunta con su resolución. Un clic en la
// hoja abre esa pregunta.
export function QuestionReviewList({ questions }: { questions: ExamQuestion[] }) {
  // En un simulacro largo empiezan solo las que fallaste; la hoja de respuestas abre cualquiera.
  const [onlyMistakes, setOnlyMistakes] = useState(questions.length > 40)
  const numbered = questions.map((question, index) => ({ question, number: index + 1 }))
  const visible = onlyMistakes ? numbered.filter(({ question }) => !question.esCorrecta) : numbered

  const openQuestion = (number: number, correct: boolean) => {
    if (onlyMistakes && correct) setOnlyMistakes(false)
    // Espera a que la pregunta esté en la página antes de abrirla.
    requestAnimationFrame(() => {
      const item = document.getElementById(anchorOf(number)) as HTMLDetailsElement | null
      if (!item) return
      item.open = true
      item.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  return (
    <div className="space-y-5">
      <div className="space-y-3 rounded-2xl bg-surface p-5 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-bold">Hoja de respuestas</h3>
          <ul aria-hidden className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-muted">
            <li className="flex items-center gap-1.5">
              <span className="size-3 rounded bg-success" /> Correcta
            </li>
            <li className="flex items-center gap-1.5">
              <span className="size-3 rounded bg-danger" /> Incorrecta
            </li>
            <li className="flex items-center gap-1.5">
              <span className="size-3 rounded border border-line" /> En blanco
            </li>
          </ul>
        </div>
        <ol className="flex flex-wrap gap-1.5">
          {numbered.map(({ question, number }) => {
            const status = statusOf(question)
            return (
              <li key={question.respuestaUsuarioId}>
                <button
                  type="button"
                  onClick={() => openQuestion(number, Boolean(question.esCorrecta))}
                  aria-label={`Pregunta ${number}: ${status.label}`}
                  className={`size-9 rounded-lg text-sm font-semibold tabular-nums transition hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${status.cell}`}
                >
                  {number}
                </button>
              </li>
            )
          })}
        </ol>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={onlyMistakes}
          onChange={(event) => setOnlyMistakes(event.target.checked)}
          className="size-4 accent-primary"
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
