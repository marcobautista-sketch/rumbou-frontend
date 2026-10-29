import { ArrowRight, Flame, Star } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { generatePath, Link, useNavigate } from 'react-router'
import { areaService } from '../../api/areaService'
import { examService } from '../../api/examService'
import { goalService } from '../../api/goalService'
import { progressService } from '../../api/progressService'
import { userService } from '../../api/userService'
import { GoalSummaryCard } from '../../components/dashboard/GoalSummaryCard'
import { NextExamCard } from '../../components/dashboard/NextExamCard'
import { ProgressSummaryCard } from '../../components/dashboard/ProgressSummaryCard'
import {
  RecommendedTopics,
  type Recommendation,
} from '../../components/dashboard/RecommendedTopics'
import { StatTile } from '../../components/dashboard/StatTile'
import { InlineError } from '../../components/feedback/InlineError'
import { PageHeader } from '../../components/layout/PageHeader'
import { buttonStyles } from '../../components/ui/buttonStyles'
import { useAuth } from '../../hooks/useAuth'
import { useFetch } from '../../hooks/useFetch'
import { paths } from '../../routes/paths'
import type { TopicDetail } from '../../types/exam'
import type { ScoreHistoryEntry } from '../../types/progress'
import { notify } from '../../utils/notify'

const MINUTES_PER_QUESTION = 2
const noHistory: ScoreHistoryEntry[] = []
const noTopics: TopicDetail[] = []

// Página contenedora: pide los datos a la API y se los pasa a las tarjetas del panel,
// que solo se encargan de mostrarlos.
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
  // Los tres temas con menos aciertos, completados con el subtema y el tiempo estimado.
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

  const goalsLoading = goals.loading && !goals.data

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
        <GoalSummaryCard
          goal={mainGoal}
          areaName={goalArea?.nombre ?? null}
          loading={goalsLoading}
          error={goals.error}
          onRetry={goals.retry}
        />
        <NextExamCard
          area={goalArea}
          hasGoal={mainGoal !== null}
          loading={goalsLoading || areas.loading}
          error={areas.error}
          onRetry={areas.retry}
        />
      </div>

      <ProgressSummaryCard
        goal={mainGoal}
        goalLoading={goalsLoading}
        history={history.data}
        historyLoading={history.loading && !history.data}
        historyError={history.error}
        onRetryHistory={history.retry}
      />

      <RecommendedTopics
        topics={recommendations}
        loading={mastery.loading && !mastery.data}
        error={mastery.error}
        startingTopicId={startingTopicId}
        onRetry={mastery.retry}
        onPractice={practiceTopic}
      />
    </main>
  )
}
