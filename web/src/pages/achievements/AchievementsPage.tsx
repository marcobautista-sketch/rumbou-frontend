import { Award, Check, Flame, Gift, Lock, Medal, NotebookPen, Zap } from 'lucide-react'
import { useCallback, useMemo } from 'react'
import { userService } from '../../api/userService'
import { StatTile } from '../../components/dashboard/StatTile'
import { InlineError } from '../../components/feedback/InlineError'
import { Page } from '../../components/layout/Page'
import { PageHeader } from '../../components/layout/PageHeader'
import { Card } from '../../components/ui/Card'
import { Skeleton } from '../../components/ui/Skeleton'
import { useFetch } from '../../hooks/useFetch'
import type { Gamification } from '../../types/gamification'
import { formatDays, formatLongDate } from '../../utils/format'
import { rankFor, ranks } from '../../utils/progressLabels'

// Cómo se gana experiencia: los mismos valores que otorga el backend (GamificacionService y
// el desafío diario).
const xpSources = [
  { icon: NotebookPen, title: 'Simulacro terminado', xp: '+100 XP' },
  { icon: Zap, title: 'Desafío diario', xp: '+50 XP si aciertas, +10 si fallas' },
  { icon: Gift, title: 'Bono semanal', xp: '+100 XP al completar 5 desafíos' },
]

// El catálogo de logros de seed/logros.csv, con el avance que se puede calcular en la app.
const catalog: {
  key: string
  title: string
  description: string
  progress: (data: Gamification) => { current: number; target: number }
}[] = [
  {
    key: 'primer simulacro',
    title: 'Primer simulacro',
    description: 'Termina tu primer simulacro.',
    progress: () => ({ current: 0, target: 1 }),
  },
  {
    key: 'racha de 7 dias',
    title: 'Racha de 7 días',
    description: 'Practica 7 días seguidos.',
    progress: (data) => ({ current: data.rachaMaxima, target: 7 }),
  },
  {
    key: 'racha de 30 dias',
    title: 'Racha de 30 días',
    description: 'Practica 30 días seguidos.',
    progress: (data) => ({ current: data.rachaMaxima, target: 30 }),
  },
  {
    key: '1000 xp',
    title: '1000 XP',
    description: 'Alcanza 1000 puntos de experiencia.',
    progress: (data) => ({ current: data.xpTotal, target: 1000 }),
  },
  {
    key: '5000 xp',
    title: '5000 XP',
    description: 'Alcanza 5000 puntos de experiencia.',
    progress: (data) => ({ current: data.xpTotal, target: 5000 }),
  },
]

const normalize = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()

export default function AchievementsPage() {
  const fetchGamification = useCallback(
    (signal: AbortSignal) => userService.getGamification(signal),
    [],
  )
  const gamification = useFetch(fetchGamification)
  const data = gamification.data
  const xpTotal = data?.xpTotal ?? 0
  const rank = useMemo(() => rankFor(xpTotal), [xpTotal])
  const rankProgress = rank.next
    ? Math.round(((xpTotal - rank.current.minXp) / (rank.next.minXp - rank.current.minXp)) * 100)
    : 100
  const unlocked = useMemo(
    () => new Map(data?.logros.map((logro) => [normalize(logro.nombre), logro])),
    [data],
  )

  return (
    <Page>
      <PageHeader
        title="Logros"
        description="Gana experiencia con cada simulacro y desafío, sube de rango y desbloquea logros."
      />

      {gamification.error ? (
        <InlineError message={gamification.error.message} onRetry={gamification.retry} />
      ) : (
        <>
          <div className="grid gap-5 lg:grid-cols-3">
            <Card aria-labelledby="rank-title" className="space-y-5 lg:col-span-2">
              {!data ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-40" />
                  <Skeleton className="h-2 w-full" />
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-primary">Tu rango</p>
                      <h2 id="rank-title" className="text-3xl font-bold tracking-tight">
                        {rank.current.name}
                      </h2>
                    </div>
                    <p className="font-display text-2xl font-bold tabular-nums">{xpTotal} XP</p>
                  </div>
                  <ol className="grid grid-cols-4 gap-2">
                    {ranks.map((step) => {
                      const reached = xpTotal >= step.minXp
                      return (
                        <li key={step.name} className="space-y-1.5">
                          <div
                            className={`h-2 rounded-full ${reached ? 'bg-accent' : 'bg-surface-muted'}`}
                          />
                          <p className={`text-sm font-semibold ${reached ? '' : 'text-ink-muted'}`}>
                            {step.name}
                          </p>
                          <p className="text-xs text-ink-muted tabular-nums">{step.minXp} XP</p>
                        </li>
                      )
                    })}
                  </ol>
                  <p className="text-sm text-ink-muted">
                    {rank.next
                      ? `Te faltan ${rank.next.minXp - xpTotal} XP para llegar a ${rank.next.name} (${rankProgress} % del camino).`
                      : 'Llegaste al rango más alto. ¡Sigue así!'}
                  </p>
                </>
              )}
            </Card>

            <Card aria-labelledby="xp-title" className="space-y-4">
              <h2 id="xp-title" className="font-bold">
                Cómo ganar experiencia
              </h2>
              <ul className="space-y-3">
                {xpSources.map(({ icon: Icon, title, xp }) => (
                  <li key={title} className="flex items-start gap-3">
                    <span className="rounded-lg bg-chip p-2 text-primary">
                      <Icon aria-hidden className="size-4" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold">{title}</span>
                      <span className="block text-sm text-ink-muted">{xp}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <StatTile
              icon={Flame}
              tone="warning"
              label="Racha actual"
              value={data ? formatDays(data.rachaActual) : null}
            />
            <StatTile
              icon={Medal}
              tone="brand"
              label="Mejor racha"
              value={data ? formatDays(data.rachaMaxima) : null}
            />
            <StatTile
              icon={Award}
              label="Logros desbloqueados"
              value={data ? `${data.logros.length} de ${catalog.length}` : null}
            />
          </div>

          <section aria-labelledby="achievements-title" className="space-y-4">
            <h2 id="achievements-title" className="text-xl font-bold">
              Tus logros
            </h2>
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {catalog.map((achievement) => {
                const done = unlocked.get(achievement.key)
                const progress = data ? achievement.progress(data) : null
                const percentage = progress
                  ? Math.min(100, Math.round((progress.current / progress.target) * 100))
                  : 0
                return (
                  <li key={achievement.key}>
                    <Card className={`flex h-full gap-4 ${done ? '' : 'bg-surface/70'}`}>
                      <span
                        className={`h-fit rounded-xl p-3 ${
                          done
                            ? 'bg-accent-soft text-accent-ink'
                            : 'bg-surface-muted text-ink-muted'
                        }`}
                      >
                        {done ? (
                          <Award aria-hidden className="size-6" />
                        ) : (
                          <Lock aria-hidden className="size-6" />
                        )}
                      </span>
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <h3 className="font-bold">{achievement.title}</h3>
                        <p className="text-sm text-ink-muted">{achievement.description}</p>
                        {done ? (
                          <p className="flex items-center gap-1 text-xs font-semibold text-success">
                            <Check aria-hidden className="size-3.5" />
                            Desbloqueado el {formatLongDate(done.fechaDesbloqueo)}
                          </p>
                        ) : (
                          progress &&
                          progress.target > 1 &&
                          (progress.current >= progress.target ? (
                            <p className="text-xs font-semibold text-primary">
                              Ya lo cumpliste: se desbloquea con tu próxima actividad.
                            </p>
                          ) : (
                            <div className="space-y-1 pt-1">
                              <div className="h-1.5 overflow-hidden rounded-full bg-surface-muted">
                                <div
                                  className="h-full rounded-full bg-primary"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <p className="text-xs text-ink-muted tabular-nums">
                                {progress.current} de {progress.target}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </Card>
                  </li>
                )
              })}
            </ul>
          </section>
        </>
      )}
    </Page>
  )
}
