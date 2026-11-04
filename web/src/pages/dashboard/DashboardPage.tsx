import { CalendarDays, Flame, Star, Zap } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { generatePath, Link, useNavigate } from 'react-router'
import { areaService } from '../../api/areaService'
import { challengeService } from '../../api/challengeService'
import { examService } from '../../api/examService'
import { goalService } from '../../api/goalService'
import { progressService } from '../../api/progressService'
import { userService } from '../../api/userService'
import { GoalHeroCard } from '../../components/dashboard/GoalHeroCard'
import { NextStepCard, type NextStep } from '../../components/dashboard/NextStepCard'
import { ProFeatureNotice } from '../../components/dashboard/ProFeatureNotice'
import {
  RecommendedTopics,
  type Recommendation,
} from '../../components/dashboard/RecommendedTopics'
import { ScoreHistoryChart } from '../../components/dashboard/ScoreHistoryChart'
import { StatTile } from '../../components/dashboard/StatTile'
import { InlineError } from '../../components/feedback/InlineError'
import { Page } from '../../components/layout/Page'
import { PageHeader } from '../../components/layout/PageHeader'
import { Card } from '../../components/ui/Card'
import { Skeleton } from '../../components/ui/Skeleton'
import { useAuth } from '../../hooks/useAuth'
import { useFetch } from '../../hooks/useFetch'
import { paths } from '../../routes/paths'
import type { TopicDetail } from '../../types/exam'
import type { ScoreHistoryEntry } from '../../types/progress'
import { fullExamHistory } from '../../utils/examSummary'
import { daysUntil, formatDate, formatDays } from '../../utils/format'
import { notify } from '../../utils/notify'
import { areaLabel, universityShort } from '../../utils/universityLabels'

const MINUTES_PER_QUESTION = 2
const noHistory: ScoreHistoryEntry[] = []
const noTopics: TopicDetail[] = []

// Página contenedora: pide los datos a la API y decide el siguiente paso; las tarjetas solo
// los muestran.
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
  const fetchChallenge = useCallback((signal: AbortSignal) => challengeService.getToday(signal), [])
  const fetchExams = useCallback(
    (signal: AbortSignal) => examService.list({ page: 0, size: 10 }, signal),
    [],
  )
  const gamification = useFetch(fetchGamification)
  const goals = useFetch(fetchGoals)
  const areas = useFetch(fetchAreas)
  const mastery = useFetch(fetchMastery)
  const challenge = useFetch(fetchChallenge)
  const exams = useFetch(fetchExams)

  // El historial y los temas dependen del área de la carrera meta (la primera de la lista).
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
  const fullExams = useMemo(() => fullExamHistory(history.data ?? []), [history.data])
  // Los temas con menos aciertos, completados con el subtema y el tiempo estimado.
  const recommendations = useMemo<Recommendation[]>(
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

  const goalsLoading = goals.loading && !goals.data
  const nextStep = useMemo<NextStep | null>(() => {
    if (goalsLoading || (exams.loading && !exams.data)) return null
    if (!mainGoal) return { kind: 'goal' }
    const recent = exams.data?.content ?? []
    const inProgress = recent.find((exam) => exam.estado === 'EN_CURSO')
    if (inProgress) return { kind: 'resume', exam: inProgress }
    if (!recent.some((exam) => exam.estado === 'FINALIZADO')) return { kind: 'diagnostic' }
    const weakest = recommendations[0]
    if (weakest) return { kind: 'topic', topic: weakest, canStart: weakest.inGoalArea }
    return { kind: 'practice' }
  }, [goalsLoading, exams.loading, exams.data, mainGoal, recommendations])

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

  if (!user) return null

  const examDays = goalArea?.fechaProximoExamen ? daysUntil(goalArea.fechaProximoExamen) : null
  const greeting =
    goalArea && examDays !== null && examDays > 0
      ? `Faltan ${formatDays(examDays)} para el examen de admisión de ${
          goalArea.universidad === 'UNI' ? 'la UNI' : universityShort(goalArea.universidad)
        }.`
      : 'Tu rumbo hacia la universidad, en un solo lugar.'
  const stats = gamification.data
  const today = challenge.data
  const examLoading = goalsLoading || (areas.loading && !areas.data)
  const examValue = examLoading
    ? null
    : examDays === null
      ? '—'
      : examDays > 0
        ? formatDays(examDays)
        : '¡Es hoy!'
  const examHint = !mainGoal
    ? 'Elige tu carrera meta'
    : goalArea?.fechaProximoExamen
      ? `${areaLabel(goalArea.universidad, goalArea.nombre)} · ${formatDate(goalArea.fechaProximoExamen)}${
          goalArea.fechaExamenConfirmada === false ? ' (estimada)' : ''
        }`
      : 'Fecha aún no anunciada'

  return (
    <Page>
      <PageHeader title={`Hola, ${user.nombre}`} description={greeting} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <GoalHeroCard
            goal={mainGoal}
            loading={goalsLoading}
            error={goals.error}
            onRetry={goals.retry}
          />
        </div>
        <NextStepCard
          step={nextStep}
          starting={startingTopicId !== null}
          onPractice={practiceTopic}
        />
      </div>

      {gamification.error ? (
        <InlineError message={gamification.error.message} onRetry={gamification.retry} />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StatTile
            icon={Flame}
            tone="warning"
            label="Racha"
            value={stats ? formatDays(stats.rachaActual) : null}
            hint={stats && `Mejor racha: ${formatDays(stats.rachaMaxima)}`}
          />
          <StatTile
            icon={Star}
            tone="brand"
            label="Esta semana"
            value={stats ? `${stats.xpSemanal} XP` : null}
            hint={stats && `${stats.xpTotal} XP en total`}
          />
          <StatTile
            icon={Zap}
            label="Desafío de hoy"
            value={today ? (today.respondido ? 'Completado' : 'Pendiente') : null}
            hint={
              today &&
              (today.respondido ? (
                `${today.desafiosDeLaSemana} de ${today.metaSemanal} esta semana`
              ) : (
                <Link to={paths.challenge} className="font-semibold text-primary hover:underline">
                  Responder (+{today.xpPorAcierto} XP)
                </Link>
              ))
            }
          />
          <StatTile
            icon={CalendarDays}
            tone="brand"
            label="Próximo examen"
            value={examValue}
            hint={examLoading ? null : examHint}
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card aria-labelledby="history-title" className="space-y-4 lg:col-span-2">
          <div className="space-y-0.5">
            <h2 id="history-title" className="text-lg font-bold">
              Evolución de tu puntaje proyectado
            </h2>
            <p className="text-sm text-ink-muted">
              Diagnóstico y simulacros completos, frente al último ingresante.
            </p>
          </div>
          {goalsLoading || (history.loading && !history.data) ? (
            <Skeleton className="h-60 w-full" />
          ) : history.error?.kind === 'forbidden' ? (
            <ProFeatureNotice message="Con PRO ves cómo cambia tu puntaje proyectado en cada simulacro completo." />
          ) : history.error ? (
            <InlineError message={history.error.message} onRetry={history.retry} />
          ) : !mainGoal ? (
            <p className="text-ink-muted">Elige tu carrera meta para ver tu evolución.</p>
          ) : fullExams.length > 1 ? (
            <ScoreHistoryChart
              history={fullExams}
              cutoff={mainGoal.puntajeUltimoIngresante}
              height={240}
            />
          ) : (
            <p className="rounded-xl bg-surface-muted p-5 text-ink-muted">
              {fullExams.length === 1
                ? 'Rinde otro simulacro completo para ver cómo cambia tu puntaje proyectado.'
                : 'Tu diagnóstico será el primer punto de esta gráfica.'}
            </p>
          )}
        </Card>
        <RecommendedTopics
          topics={recommendations}
          loading={mastery.loading && !mastery.data}
          error={mastery.error}
          startingTopicId={startingTopicId}
          onRetry={mastery.retry}
          onPractice={practiceTopic}
        />
      </div>
    </Page>
  )
}
