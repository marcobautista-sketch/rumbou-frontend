import { Flame, Gift, Star } from 'lucide-react'
import { formatDays } from '../../utils/format'
import { Card } from '../ui/Card'
import { Skeleton } from '../ui/Skeleton'

interface ChallengeStatsProps {
  streak: number | null
  weeklyXp: number | null
  completedThisWeek: number
  weeklyGoal: number
}

// Lo que motiva a volver mañana: la racha, la experiencia de la semana y el bono semanal.
export function ChallengeStats({
  streak,
  weeklyXp,
  completedThisWeek,
  weeklyGoal,
}: ChallengeStatsProps) {
  const progress = Math.min(100, Math.round((completedThisWeek / weeklyGoal) * 100))
  const missing = Math.max(0, weeklyGoal - completedThisWeek)

  return (
    <Card className="space-y-5 p-5 lg:sticky lg:top-6">
      <dl className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <dt className="flex items-center gap-1.5 text-sm text-ink-muted">
            <Flame aria-hidden className="size-4 text-warning" />
            Racha
          </dt>
          <dd className="font-display text-2xl font-bold tabular-nums">
            {streak === null ? <Skeleton className="h-7 w-16" /> : formatDays(streak)}
          </dd>
        </div>
        <div className="space-y-1">
          <dt className="flex items-center gap-1.5 text-sm text-ink-muted">
            <Star aria-hidden className="size-4 text-primary" />
            Esta semana
          </dt>
          <dd className="font-display text-2xl font-bold tabular-nums">
            {weeklyXp === null ? <Skeleton className="h-7 w-16" /> : `${weeklyXp} XP`}
          </dd>
        </div>
      </dl>
      <div className="space-y-2 border-t border-line pt-4">
        <div className="flex items-center justify-between gap-2">
          <p className="flex items-center gap-1.5 font-semibold">
            <Gift aria-hidden className="size-4 text-accent-ink" />
            Bono semanal
          </p>
          <p className="text-sm font-semibold tabular-nums">
            {Math.min(completedThisWeek, weeklyGoal)} de {weeklyGoal}
          </p>
        </div>
        <div
          role="progressbar"
          aria-label="Desafíos de la semana"
          aria-valuemin={0}
          aria-valuemax={weeklyGoal}
          aria-valuenow={completedThisWeek}
          className="h-2 overflow-hidden rounded-full bg-surface-muted"
        >
          <div
            className="h-full rounded-full bg-accent transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-ink-muted">
          {missing > 0
            ? `Responde ${missing} ${missing === 1 ? 'desafío más' : 'desafíos más'} esta semana y gana 100 XP extra.`
            : '¡Conseguiste el bono semanal de 100 XP!'}
        </p>
      </div>
    </Card>
  )
}
