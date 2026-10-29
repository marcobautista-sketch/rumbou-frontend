import { ArrowRight, CalendarDays, Clock, Flag, Flame, NotebookPen, Star } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { generatePath, Link, useNavigate } from 'react-router'
import { areaService } from '../../api/areaService'
import { examService } from '../../api/examService'
import { goalService } from '../../api/goalService'
import { progressService } from '../../api/progressService'
import { userService } from '../../api/userService'
import { ProFeatureNotice } from '../../components/dashboard/ProFeatureNotice'
import { ScoreHistoryChart } from '../../components/dashboard/ScoreHistoryChart'
import { StatTile } from '../../components/dashboard/StatTile'
import { InlineError } from '../../components/feedback/InlineError'
import { PageHeader } from '../../components/layout/PageHeader'
import { Badge } from '../../components/ui/Badge'
import { buttonStyles } from '../../components/ui/buttonStyles'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { Skeleton } from '../../components/ui/Skeleton'
import { useAuth } from '../../hooks/useAuth'
import { useFetch } from '../../hooks/useFetch'
import { paths } from '../../routes/paths'
import type { TopicDetail } from '../../types/exam'
import type { ScoreHistoryEntry } from '../../types/progress'
import { daysUntil, formatDate, formatScore } from '../../utils/format'
import { notify } from '../../utils/notify'
import { masteryTone, preparationTones } from '../../utils/progressLabels'

const MINUTES_PER_QUESTION = 2
const recommendationCard =
  'block h-full rounded-2xl bg-surface p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-raised focus-visible:outline-2 focus-visible:outline-accent'
const noHistory: ScoreHistoryEntry[] = []
const noTopics: TopicDetail[] = []

function CardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-6 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  )
}

function FirstExamEmptyState() {
  return (
    <EmptyState
      icon={NotebookPen}
      title="Aún no tienes resultados"
      message="Rinde un simulacro para medir tu puntaje y compararlo con el del último ingresante."
      action={
        <Link to={paths.newExam} className={buttonStyles('primary')}>
          Rinde tu primer simulacro
        </Link>
      }
    />
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [startingTopicId, setStartingTopicId] = useState<number | null>(null)
  const fetchGamification = useCallback(
    (signal: AbortSignal) => userService.getGamification(signal),
    [],
  )
  const fetchGoals = useCallback((signal: AbortSignal) => goalService.list(signal), [])
  const fetchAreas = useCallback((signal: AbortSignal) => areaService.list(signal), [])
  const fetchMastery = useCallback(
    (signal: AbortSignal) => progressService.getTopicMastery(signal),
    [],
  )
  const gamification = useFetch(fetchGamification)
  const goals = useFetch(fetchGoals)
  const areas = useFetch(fetchAreas)
  const mastery = useFetch(fetchMastery)

  const mainGoal = goals.data?.[0] ?? null
  const areaId = mainGoal?.areaId ?? null
  const fetchHistory = useCallback(
    (signal: AbortSignal) =>
      areaId ? progressService.getScoreHistory(areaId, signal) : Promise.resolve(noHistory),
    [areaId],
  )
  const fetchTopics = useCallback(
    (signal: AbortSignal) =>
      areaId ? areaService.listTopics(areaId, signal) : Promise.resolve(noTopics),
    [areaId],
  )
  const history = useFetch(fetchHistory)
  const topics = useFetch(fetchTopics)

  const goalArea = useMemo(
    () => areas.data?.find((area) => area.id === areaId) ?? null,
    [areas.data, areaId],
  )
  const recommendations = useMemo(
    () =>
      [...(mastery.data ?? [])]
        .sort((a, b) => a.porcentajeAciertos - b.porcentajeAciertos)
        .slice(0, 3)
        .map((entry) => {
          const topic = topics.data?.find((candidate) => candidate.id === entry.temaId)
          return {
            ...entry,
            inGoalArea: topic !== undefined,
            subtema: topic?.subtemas[0] ?? null,
            minutes: topic ? topic.cantidadPreguntas * MINUTES_PER_QUESTION : null,
          }
        }),
    [mastery.data, topics.data],
  )

  // Un clic en un tema recomendado empieza un simulacro de ese tema en el área de la meta.
  const practiceTopic = async (temaId: number) => {
    if (!areaId) return
    setStartingTopicId(temaId)
    try {
      const examId = await examService.start({ areaId, tipo: 'POR_TEMA', temaId })
      navigate(generatePath(paths.exam, { examId: String(examId) }))
    } catch (error) {
      notify.error(error)
      setStartingTopicId(null)
    }
  }
  const firstScore = history.data?.[0]?.psp ?? null
  const latestScore = mainGoal?.ultimoPsp ?? null
  const examDays = goalArea?.fechaProximoExamen ? daysUntil(goalArea.fechaProximoExamen) : null

  if (!user) return null

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
      <PageHeader
        title={`Hola, ${user.nombre}`}
        description="Este es tu rumbo hacia la universidad. Sigue sumando cada día."
        actions={
          <Link to={paths.newExam} className={buttonStyles('primary')}>
            Realizar simulacro
            <ArrowRight aria-hidden className="size-4" />
          </Link>
        }
      />

      {gamification.error ? (
        <InlineError message={gamification.error.message} onRetry={gamification.retry} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <StatTile
            icon={Flame}
            label="Racha diaria"
            value={gamification.data ? `${gamification.data.rachaActual} días` : null}
          />
          <StatTile
            icon={Star}
            tone="brand"
            label="Puntos totales"
            value={gamification.data ? `${gamification.data.xpTotal} XP` : null}
          />
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card aria-labelledby="goal-title" className="space-y-3">
          <h2 id="goal-title" className="flex items-center gap-2 text-lg font-semibold">
            <Flag aria-hidden className="size-5 text-accent-ink" />
            Mi meta
          </h2>
          {goals.loading && !goals.data ? (
            <CardSkeleton />
          ) : goals.error ? (
            <InlineError message={goals.error.message} onRetry={goals.retry} />
          ) : mainGoal ? (
            <div className="space-y-2">
              <p className="text-sm font-semibold tracking-wide text-ink-muted uppercase">
                {mainGoal.universidad} · {goalArea?.nombre ?? mainGoal.area}
              </p>
              <p className="font-display text-xl font-bold">{mainGoal.carrera}</p>
              {mainGoal.estado && (
                <Badge tone={preparationTones[mainGoal.estado]}>{mainGoal.estadoDescripcion}</Badge>
              )}
              <Link to={paths.progress} className="block text-sm font-semibold text-accent-ink">
                Ver todos mis objetivos
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-ink-muted">Aún no eliges la carrera a la que postulas.</p>
              <Link to={paths.progress} className={buttonStyles('secondary', 'sm')}>
                Elegir mi carrera
              </Link>
            </div>
          )}
        </Card>

        <Card aria-labelledby="exam-date-title" className="space-y-3">
          <h2 id="exam-date-title" className="flex items-center gap-2 text-lg font-semibold">
            <CalendarDays aria-hidden className="size-5 text-accent-ink" />
            Próximo examen
          </h2>
          {(goals.loading && !goals.data) || areas.loading ? (
            <CardSkeleton />
          ) : areas.error ? (
            <InlineError message={areas.error.message} onRetry={areas.retry} />
          ) : goalArea?.fechaProximoExamen && examDays !== null ? (
            <div className="space-y-2">
              <p className="font-display text-3xl font-bold">
                {examDays > 0 ? `${examDays} ${examDays === 1 ? 'día' : 'días'}` : '¡Es hoy!'}
              </p>
              <p className="text-ink-muted">
                {formatDate(goalArea.fechaProximoExamen)} · Proceso {goalArea.procesoProximo}
              </p>
              {goalArea.fechaExamenConfirmada === false && (
                <Badge tone="warning">Fecha estimada</Badge>
              )}
            </div>
          ) : (
            <p className="text-ink-muted">
              {mainGoal
                ? 'La universidad aún no anuncia la fecha del próximo examen.'
                : 'Elige tu carrera meta para ver cuánto falta para tu examen.'}
            </p>
          )}
        </Card>
      </div>

      <Card aria-labelledby="progress-title" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="progress-title" className="text-lg font-semibold">
            Tu progreso
          </h2>
          {mainGoal && (
            <Link to={paths.progress} className="text-sm font-semibold text-accent-ink">
              Ver el detalle
            </Link>
          )}
        </div>
        {goals.loading && !goals.data ? (
          <Skeleton className="h-48 w-full" />
        ) : !mainGoal ? (
          <EmptyState
            icon={Flag}
            title="Elige tu carrera meta"
            message="Compararemos tu puntaje con el del último ingresante de la carrera a la que postulas."
            action={
              <Link to={paths.progress} className={buttonStyles('primary')}>
                Elegir mi carrera
              </Link>
            }
          />
        ) : latestScore === null ? (
          <FirstExamEmptyState />
        ) : (
          <>
            <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div>
                <dt className="text-sm text-ink-muted">Puntaje inicial</dt>
                <dd className="font-display text-2xl font-bold">
                  {firstScore === null ? '—' : formatScore(firstScore)}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-ink-muted">Puntaje actual</dt>
                <dd className="font-display text-2xl font-bold text-accent-ink">
                  {formatScore(latestScore)}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-ink-muted">Último ingresante</dt>
                <dd className="font-display text-2xl font-bold">
                  {formatScore(mainGoal.puntajeUltimoIngresante)}
                </dd>
              </div>
            </dl>
            {history.loading && !history.data ? (
              <Skeleton className="h-52 w-full" />
            ) : history.error?.kind === 'forbidden' ? (
              <ProFeatureNotice message="Con PRO ves cómo evoluciona tu puntaje en cada simulacro." />
            ) : history.error ? (
              <InlineError message={history.error.message} onRetry={history.retry} />
            ) : (
              history.data &&
              history.data.length > 1 && (
                <ScoreHistoryChart
                  history={history.data}
                  cutoff={mainGoal.puntajeUltimoIngresante}
                  height={220}
                />
              )
            )}
          </>
        )}
      </Card>

      <section aria-labelledby="recommended-title" className="space-y-3">
        <h2 id="recommended-title" className="text-lg font-semibold">
          Recomendado para ti
        </h2>
        {mastery.loading && !mastery.data ? (
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => (
              <Card key={index}>
                <CardSkeleton />
              </Card>
            ))}
          </div>
        ) : mastery.error?.kind === 'forbidden' ? (
          <ProFeatureNotice message="Con PRO te recomendamos los temas que más necesitas reforzar." />
        ) : mastery.error ? (
          <InlineError message={mastery.error.message} onRetry={mastery.retry} />
        ) : recommendations.length === 0 ? (
          <FirstExamEmptyState />
        ) : (
          <ul className="grid gap-4 md:grid-cols-3">
            {recommendations.map((topic) => {
              const starting = startingTopicId === topic.temaId
              const content = (
                <>
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold">{topic.tema}</p>
                    <Badge tone={masteryTone(topic.porcentajeAciertos)}>
                      {topic.porcentajeAciertos}%
                    </Badge>
                  </div>
                  {topic.subtema && (
                    <p className="mt-1 text-sm text-ink-muted">Repasa: {topic.subtema}</p>
                  )}
                  <p className="mt-3 flex items-center justify-between gap-2 text-sm text-ink-muted">
                    {topic.minutes !== null && (
                      <span className="flex items-center gap-1.5">
                        <Clock aria-hidden className="size-4" />
                        {topic.minutes} min
                      </span>
                    )}
                    {topic.inGoalArea && (
                      <span className="ml-auto font-semibold text-accent-ink">
                        {starting ? 'Preparando…' : 'Practicar ahora'}
                      </span>
                    )}
                  </p>
                </>
              )
              return (
                <li key={topic.temaId}>
                  {topic.inGoalArea ? (
                    <button
                      type="button"
                      onClick={() => practiceTopic(topic.temaId)}
                      disabled={startingTopicId !== null}
                      aria-busy={starting}
                      className={`${recommendationCard} w-full text-left disabled:cursor-wait disabled:opacity-70`}
                    >
                      {content}
                    </button>
                  ) : (
                    <Link to={paths.newExam} className={recommendationCard}>
                      {content}
                    </Link>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </main>
  )
}
