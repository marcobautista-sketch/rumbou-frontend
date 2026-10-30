import { Award, Flame, Medal, Trophy } from 'lucide-react'
import { useCallback, useMemo } from 'react'
import { Link } from 'react-router'
import { userService } from '../../api/userService'
import { StatTile } from '../../components/dashboard/StatTile'
import { InlineError } from '../../components/feedback/InlineError'
import { PageHeader } from '../../components/layout/PageHeader'
import { buttonStyles } from '../../components/ui/buttonStyles'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { Skeleton, SkeletonList } from '../../components/ui/Skeleton'
import { useFetch } from '../../hooks/useFetch'
import { paths } from '../../routes/paths'
import { formatDays, formatLongDate } from '../../utils/format'
import { rankFor } from '../../utils/progressLabels'

export default function AchievementsPage() {
  const fetchGamification = useCallback(
    (signal: AbortSignal) => userService.getGamification(signal),
    [],
  )
  const gamification = useFetch(fetchGamification)
  const xpTotal = gamification.data?.xpTotal ?? 0
  const rank = useMemo(() => rankFor(xpTotal), [xpTotal])
  const rankProgress = rank.next
    ? Math.round(((xpTotal - rank.current.minXp) / (rank.next.minXp - rank.current.minXp)) * 100)
    : 100
  const achievements = useMemo(
    () =>
      [...(gamification.data?.logros ?? [])].sort((a, b) =>
        b.fechaDesbloqueo.localeCompare(a.fechaDesbloqueo),
      ),
    [gamification.data],
  )

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
      <PageHeader
        title="Mis logros"
        description="Cada simulacro y desafío te acerca a un nuevo rango."
        breadcrumbs={[{ label: 'Inicio', to: paths.dashboard }, { label: 'Mis logros' }]}
      />

      {gamification.error ? (
        <InlineError message={gamification.error.message} onRetry={gamification.retry} />
      ) : (
        <>
          <Card aria-labelledby="rank-title" className="space-y-4">
            {gamification.loading && !gamification.data ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-40" />
                <Skeleton className="h-2 w-full" />
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-4">
                  <span className="rounded-full bg-accent-soft p-4 text-accent-ink">
                    <Trophy aria-hidden className="size-8" />
                  </span>
                  <div>
                    <p className="text-sm font-medium tracking-wide text-ink-muted uppercase">
                      Tu rango
                    </p>
                    <h2 id="rank-title" className="text-2xl font-bold">
                      {rank.current.name}
                    </h2>
                  </div>
                  <p className="ml-auto font-display text-2xl font-bold">{xpTotal} XP</p>
                </div>
                <div
                  role="progressbar"
                  aria-label="Avance al siguiente rango"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={rankProgress}
                  className="h-2 overflow-hidden rounded-full bg-surface-muted"
                >
                  <div
                    className="h-full rounded-full bg-accent transition-all"
                    style={{ width: `${rankProgress}%` }}
                  />
                </div>
                <p className="text-sm text-ink-muted">
                  {rank.next
                    ? `Te faltan ${rank.next.minXp - xpTotal} XP para llegar a ${rank.next.name}.`
                    : 'Llegaste al rango más alto. ¡Sigue así!'}
                </p>
              </>
            )}
          </Card>

          <div className="grid gap-4 sm:grid-cols-3">
            <StatTile
              icon={Flame}
              label="Racha actual"
              value={gamification.data ? formatDays(gamification.data.rachaActual) : null}
            />
            <StatTile
              icon={Medal}
              tone="brand"
              label="Mejor racha"
              value={gamification.data ? formatDays(gamification.data.rachaMaxima) : null}
            />
            <StatTile
              icon={Award}
              label="Logros"
              value={gamification.data ? String(achievements.length) : null}
            />
          </div>

          <section aria-labelledby="achievements-title" className="space-y-4">
            <h2 id="achievements-title" className="text-xl font-bold">
              Logros desbloqueados
            </h2>
            {gamification.loading && !gamification.data ? (
              <SkeletonList rows={3} label="Cargando tus logros…" />
            ) : achievements.length === 0 ? (
              <EmptyState
                icon={Award}
                title="Aún no desbloqueas logros"
                message="Rinde simulacros y responde el desafío diario para ganar tus primeros logros."
                action={
                  <Link to={paths.newExam} className={buttonStyles('primary')}>
                    Rinde tu primer simulacro
                  </Link>
                }
              />
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {achievements.map((achievement) => (
                  <li key={achievement.id}>
                    <Card className="flex h-full gap-4">
                      <span className="h-fit rounded-full bg-chip p-3 text-primary">
                        <Award aria-hidden className="size-6" />
                      </span>
                      <div className="space-y-1">
                        <h3 className="font-semibold">{achievement.nombre}</h3>
                        <p className="text-sm text-ink-muted">{achievement.descripcion}</p>
                        <p className="text-xs font-medium text-accent-ink">
                          Desbloqueado el {formatLongDate(achievement.fechaDesbloqueo)}
                        </p>
                      </div>
                    </Card>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </main>
  )
}
