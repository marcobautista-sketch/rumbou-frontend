import { Timer, Zap } from 'lucide-react'
import { useCallback, useState } from 'react'
import { challengeService } from '../../api/challengeService'
import { userService } from '../../api/userService'
import { ChallengeResult } from '../../components/challenge/ChallengeResult'
import { ChallengeStats } from '../../components/challenge/ChallengeStats'
import { QuestionCard } from '../../components/exam/QuestionCard'
import { InlineError } from '../../components/feedback/InlineError'
import { PageHeader } from '../../components/layout/PageHeader'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { SkeletonList } from '../../components/ui/Skeleton'
import { useElapsedSeconds } from '../../hooks/useElapsedSeconds'
import { useFetch } from '../../hooks/useFetch'
import type { DailyChallenge } from '../../types/challenge'
import { formatDuration } from '../../utils/format'
import { notify } from '../../utils/notify'

const SUGGESTED_SECONDS = 5 * 60

function PendingChallenge({
  challenge,
  onAnswered,
}: {
  challenge: DailyChallenge
  onAnswered: (result: DailyChallenge) => void
}) {
  const [selected, setSelected] = useState<number | null>(null)
  const [sending, setSending] = useState(false)
  const [startedAt] = useState(() => new Date().toISOString())
  const remaining = Math.max(0, SUGGESTED_SECONDS - useElapsedSeconds(startedAt))

  const submit = async () => {
    if (selected === null) return
    setSending(true)
    try {
      const result = await challengeService.answer(selected)
      notify.success(
        result.esCorrecta
          ? `¡Correcto! Ganaste ${result.xpGanado} XP.`
          : `Sumaste ${result.xpGanado} XP por intentarlo.`,
      )
      onAnswered(result)
    } catch (error) {
      notify.error(error)
      setSending(false)
    }
  }

  return (
    <section aria-labelledby="challenge-title" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="challenge-title" className="text-xl font-bold">
          Desafío de hoy
        </h2>
        <div className="flex items-center gap-2">
          <span
            aria-label="Tiempo sugerido"
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-sm font-semibold ${
              remaining > 0 ? 'bg-danger-soft text-danger' : 'bg-surface-muted text-ink-muted'
            }`}
          >
            <Timer aria-hidden className="size-4" />
            {remaining > 0 ? formatDuration(remaining) : 'Tiempo cumplido'}
          </span>
          <Badge tone="brand">
            <Zap aria-hidden className="size-3.5" />+{challenge.xpPorAcierto} XP
          </Badge>
        </div>
      </div>
      <QuestionCard question={challenge} position={1} selected={selected} onSelect={setSelected} />
      <Button
        onClick={submit}
        disabled={selected === null}
        loading={sending}
        className="w-full sm:w-auto"
      >
        Responder desafío
      </Button>
    </section>
  )
}

export default function ChallengePage() {
  const fetchChallenge = useCallback((signal: AbortSignal) => challengeService.getToday(signal), [])
  const fetchGamification = useCallback(
    (signal: AbortSignal) => userService.getGamification(signal),
    [],
  )
  const challenge = useFetch(fetchChallenge)
  const gamification = useFetch(fetchGamification)
  const [answered, setAnswered] = useState<DailyChallenge | null>(null)
  const current = answered ?? challenge.data

  const handleAnswered = (result: DailyChallenge) => {
    setAnswered(result)
    gamification.retry()
  }

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6">
      <PageHeader
        title="Desafío diario"
        description="Mantén tu inercia académica. Un desafío a la vez."
        breadcrumbs={[{ label: 'Desafío diario' }]}
      />

      <ChallengeStats
        streak={gamification.data?.rachaActual ?? null}
        weeklyXp={gamification.data?.xpSemanal ?? null}
        completedThisWeek={current?.desafiosDeLaSemana ?? 0}
        weeklyGoal={current?.metaSemanal ?? 5}
      />

      {challenge.loading && !current ? (
        <SkeletonList rows={4} label="Cargando el desafío de hoy…" />
      ) : challenge.error && !current ? (
        <InlineError message={challenge.error.message} onRetry={challenge.retry} />
      ) : current?.respondido ? (
        <ChallengeResult challenge={current} />
      ) : (
        current && <PendingChallenge challenge={current} onAnswered={handleAnswered} />
      )}
    </main>
  )
}
