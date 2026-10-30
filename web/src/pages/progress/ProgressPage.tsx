import { ChartColumn, NotebookPen, Plus, Target } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { goalService } from '../../api/goalService'
import { progressService } from '../../api/progressService'
import { AddGoalModal } from '../../components/dashboard/AddGoalModal'
import { GoalCard } from '../../components/dashboard/GoalCard'
import { ProFeatureNotice } from '../../components/dashboard/ProFeatureNotice'
import { ScoreHistoryChart } from '../../components/dashboard/ScoreHistoryChart'
import { TopicMasteryChart } from '../../components/dashboard/TopicMasteryChart'
import { InlineError } from '../../components/feedback/InlineError'
import { PageHeader } from '../../components/layout/PageHeader'
import { Button } from '../../components/ui/Button'
import { buttonStyles } from '../../components/ui/buttonStyles'
import { Card } from '../../components/ui/Card'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { EmptyState } from '../../components/ui/EmptyState'
import { SelectField } from '../../components/ui/SelectField'
import { Skeleton, SkeletonList } from '../../components/ui/Skeleton'
import { useFetch } from '../../hooks/useFetch'
import { paths } from '../../routes/paths'
import type { Goal } from '../../types/goal'
import type { ScoreHistoryEntry } from '../../types/progress'
import { notify } from '../../utils/notify'

const noHistory: ScoreHistoryEntry[] = []

function NoResultsYet({ message }: { message: string }) {
  return (
    <EmptyState
      icon={NotebookPen}
      title="Todavía no hay datos"
      message={message}
      action={
        <Link to={paths.newExam} className={buttonStyles('primary')}>
          Rinde tu primer simulacro
        </Link>
      }
    />
  )
}

export default function ProgressPage() {
  const [adding, setAdding] = useState(false)
  const [goalToRemove, setGoalToRemove] = useState<Goal | null>(null)
  const [removing, setRemoving] = useState(false)
  const [selectedAreaId, setSelectedAreaId] = useState<number | null>(null)

  const fetchGoals = useCallback((signal: AbortSignal) => goalService.list(signal), [])
  const fetchMastery = useCallback(
    (signal: AbortSignal) => progressService.getTopicMastery(signal),
    [],
  )
  const goals = useFetch(fetchGoals)
  const mastery = useFetch(fetchMastery)

  const areaOptions = useMemo(() => {
    const byArea = new Map<number, Goal>()
    goals.data?.forEach((goal) => {
      if (!byArea.has(goal.areaId)) byArea.set(goal.areaId, goal)
    })
    return [...byArea.values()]
  }, [goals.data])
  const historyGoal =
    areaOptions.find((goal) => goal.areaId === selectedAreaId) ?? areaOptions[0] ?? null
  const historyAreaId = historyGoal?.areaId ?? null
  const fetchHistory = useCallback(
    (signal: AbortSignal) =>
      historyAreaId
        ? progressService.getScoreHistory(historyAreaId, signal)
        : Promise.resolve(noHistory),
    [historyAreaId],
  )
  const history = useFetch(fetchHistory)
  const takenOfferIds = useMemo(
    () => goals.data?.map((goal) => goal.ofertaAcademicaId) ?? [],
    [goals.data],
  )

  const confirmRemoval = async () => {
    if (!goalToRemove) return
    setRemoving(true)
    try {
      await goalService.remove(goalToRemove.id)
      notify.success(`Quitamos ${goalToRemove.carrera} de tus objetivos`)
      setGoalToRemove(null)
      goals.retry()
    } catch (error) {
      notify.error(error)
    } finally {
      setRemoving(false)
    }
  }

  return (
    <main className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6">
      <PageHeader
        title="Mi progreso"
        description="Tu probabilidad de ingreso, tus temas y cómo evoluciona tu puntaje."
        breadcrumbs={[{ label: 'Inicio', to: paths.dashboard }, { label: 'Mi progreso' }]}
        actions={
          <>
            <Link to={paths.careers} className={buttonStyles('secondary')}>
              Explorar carreras
            </Link>
            <Button onClick={() => setAdding(true)}>
              <Plus aria-hidden className="size-4" />
              Agregar objetivo
            </Button>
          </>
        }
      />

      <section aria-labelledby="goals-title" className="space-y-4">
        <h2 id="goals-title" className="text-xl font-bold">
          Probabilidad de ingreso
        </h2>
        {goals.loading && !goals.data ? (
          <SkeletonList rows={2} label="Cargando tus objetivos…" />
        ) : goals.error ? (
          <InlineError message={goals.error.message} onRetry={goals.retry} />
        ) : goals.data?.length === 0 ? (
          <EmptyState
            icon={Target}
            title="Aún no tienes carreras objetivo"
            message="Elige a qué carrera postulas para comparar tus simulacros con su puntaje de ingreso."
            action={<Button onClick={() => setAdding(true)}>Agregar objetivo</Button>}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {goals.data?.map((goal) => (
              <GoalCard key={goal.id} goal={goal} onRemove={setGoalToRemove} />
            ))}
          </div>
        )}
      </section>

      <Card aria-labelledby="history-title" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="history-title" className="text-lg font-semibold">
            Evolución de tu puntaje
          </h2>
          {areaOptions.length > 1 && (
            <SelectField
              label="Área"
              value={historyAreaId ?? ''}
              onChange={(event) => setSelectedAreaId(Number(event.target.value))}
              className="w-full sm:w-64"
            >
              {areaOptions.map((goal) => (
                <option key={goal.areaId} value={goal.areaId}>
                  {goal.universidad} · {goal.carrera}
                </option>
              ))}
            </SelectField>
          )}
        </div>
        {(goals.loading && !goals.data) || (history.loading && !history.data) ? (
          <Skeleton className="h-64 w-full" />
        ) : history.error?.kind === 'forbidden' ? (
          <ProFeatureNotice message="Con PRO ves cómo evoluciona tu PSP simulacro a simulacro." />
        ) : history.error ? (
          <InlineError message={history.error.message} onRetry={history.retry} />
        ) : !historyGoal ? (
          <p className="text-ink-muted">Agrega una carrera objetivo para ver tu evolución.</p>
        ) : history.data && history.data.length > 0 ? (
          <ScoreHistoryChart history={history.data} cutoff={historyGoal.puntajeUltimoIngresante} />
        ) : (
          <NoResultsYet message="Cuando finalices un simulacro de esta área verás aquí tu PSP." />
        )}
      </Card>

      <Card aria-labelledby="mastery-title" className="space-y-4">
        <h2 id="mastery-title" className="flex items-center gap-2 text-lg font-semibold">
          <ChartColumn aria-hidden className="size-5 text-accent-ink" />
          Dominio por tema
        </h2>
        {mastery.loading && !mastery.data ? (
          <Skeleton className="h-64 w-full" />
        ) : mastery.error?.kind === 'forbidden' ? (
          <ProFeatureNotice message="Con PRO ves en qué temas aciertas más y cuáles debes reforzar." />
        ) : mastery.error ? (
          <InlineError message={mastery.error.message} onRetry={mastery.retry} />
        ) : mastery.data && mastery.data.length > 0 ? (
          <TopicMasteryChart topics={mastery.data} />
        ) : (
          <NoResultsYet message="Tus aciertos por tema aparecerán cuando finalices un simulacro." />
        )}
      </Card>

      <AddGoalModal
        open={adding}
        takenOfferIds={takenOfferIds}
        onClose={() => setAdding(false)}
        onAdded={() => {
          setAdding(false)
          goals.retry()
        }}
      />
      <ConfirmDialog
        open={goalToRemove !== null}
        title="¿Quitar este objetivo?"
        message={
          goalToRemove
            ? `Dejarás de seguir ${goalToRemove.carrera} (${goalToRemove.universidad}). Puedes volver a agregarla cuando quieras.`
            : ''
        }
        confirmLabel="Quitar objetivo"
        confirmVariant="danger"
        loading={removing}
        onConfirm={confirmRemoval}
        onCancel={() => setGoalToRemove(null)}
      />
    </main>
  )
}
