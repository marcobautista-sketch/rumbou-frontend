import { Flame, Star } from 'lucide-react'
import { Card } from '../ui/Card'
import { Skeleton } from '../ui/Skeleton'

interface ChallengeStatsProps {
  streak: number | null
  weeklyXp: number | null
  completedThisWeek: number
  weeklyGoal: number
}

export function ChallengeStats({
  streak,
  weeklyXp,
  completedThisWeek,
  weeklyGoal,
}: ChallengeStatsProps) {
  const progress = Math.min(100, Math.round((completedThisWeek / weeklyGoal) * 100))
  const missing = Math.max(0, weeklyGoal - completedThisWeek)

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card className="flex items-center gap-4">
        <span className="rounded-full bg-accent-soft p-3 text-accent-ink">
          <Flame aria-hidden className="size-6" />
        </span>
        <div>
          {streak === null ? (
            <Skeleton className="h-7 w-20" />
          ) : (
            <p className="font-display text-2xl font-bold">{streak} días</p>
          )}
          <p className="text-sm font-medium tracking-wide text-ink-muted uppercase">Racha diaria</p>
        </div>
      </Card>
      <Card className="flex items-center gap-4">
        <span className="rounded-full bg-chip p-3 text-primary">
          <Star aria-hidden className="size-6" />
        </span>
        <div>
          {weeklyXp === null ? (
            <Skeleton className="h-7 w-20" />
          ) : (
            <p className="font-display text-2xl font-bold">{weeklyXp} XP</p>
          )}
          <p className="text-sm font-medium tracking-wide text-ink-muted uppercase">Esta semana</p>
        </div>
      </Card>
      <Card className="space-y-3 sm:col-span-2">
        <div className="flex justify-between gap-2">
          <p className="font-semibold">Progreso semanal</p>
          <p className="font-semibold text-accent-ink">{progress}%</p>
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
        <p className="text-center text-sm text-ink-muted">
          {missing > 0
            ? `Faltan ${missing} ${missing === 1 ? 'desafío' : 'desafíos'} para el bono semanal de 100 XP`
            : '¡Conseguiste el bono semanal!'}
        </p>
      </Card>
    </div>
  )
}
