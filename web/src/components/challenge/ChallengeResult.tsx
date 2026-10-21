import { CalendarClock, CircleCheck, CircleX } from 'lucide-react'
import type { DailyChallenge } from '../../types/challenge'
import { formatMath } from '../../utils/formatMath'
import { AnswerReview } from '../exam/AnswerReview'
import { TutorPanel } from '../questions/TutorPanel'
import { SolutionReviewPanel } from '../solution/SolutionReviewPanel'
import { Card } from '../ui/Card'

export function ChallengeResult({ challenge }: { challenge: DailyChallenge }) {
  const correct = challenge.esCorrecta === true

  return (
    <div className="space-y-4">
      <section
        role="status"
        className={`flex animate-fade-in items-center gap-4 rounded-2xl p-6 ${
          correct ? 'bg-success/10' : 'bg-danger-soft'
        }`}
      >
        {correct ? (
          <CircleCheck aria-hidden className="size-10 shrink-0 text-success" />
        ) : (
          <CircleX aria-hidden className="size-10 shrink-0 text-danger" />
        )}
        <div>
          <p className="font-display text-xl font-bold">
            {correct ? '¡Correcto!' : 'Esta vez no fue'}
          </p>
          <p className="text-ink-muted">
            Ganaste {challenge.xpGanado} XP{correct ? '' : ' por intentarlo'}.
          </p>
        </div>
      </section>

      <Card className="space-y-4">
        <p className="text-lg whitespace-pre-line">{formatMath(challenge.enunciado)}</p>
        {challenge.claveCorrecta !== null && (
          <AnswerReview
            alternatives={challenge.alternativas}
            correct={challenge.claveCorrecta}
            marked={challenge.alternativaMarcada}
          />
        )}
        {challenge.explicacion && (
          <div className="rounded-xl bg-surface-muted p-4">
            <p className="mb-1 font-semibold">Explicación</p>
            <p className="whitespace-pre-line text-ink-muted">
              {formatMath(challenge.explicacion)}
            </p>
          </div>
        )}
      </Card>

      {!correct && (
        <TutorPanel
          questionId={challenge.preguntaId}
          markedAlternative={challenge.alternativaMarcada}
        />
      )}

      <SolutionReviewPanel questionId={challenge.preguntaId} statement={challenge.enunciado} />

      <p className="flex items-center justify-center gap-2 text-ink-muted">
        <CalendarClock aria-hidden className="size-5" />
        Vuelve mañana por un nuevo desafío.
      </p>
    </div>
  )
}
