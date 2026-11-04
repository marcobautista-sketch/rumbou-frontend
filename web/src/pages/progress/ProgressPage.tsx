import { NotebookPen, Plus, Target } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { goalService } from '../../api/goalService'
import { progressService } from '../../api/progressService'
import { AddGoalModal } from '../../components/dashboard/AddGoalModal'
import { GoalCard } from '../../components/dashboard/GoalCard'
import { ProFeatureNotice } from '../../components/dashboard/ProFeatureNotice'
import { ScoreHistoryChart } from '../../components/dashboard/ScoreHistoryChart'
import { TopicMasteryList } from '../../components/dashboard/TopicMasteryList'
import { InlineError } from '../../components/feedback/InlineError'
import { Page } from '../../components/layout/Page'
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
import { fullExamHistory } from '../../utils/examSummary'
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
  const fullExams = useMemo(() => fullExamHistory(history.data ?? []), [history.data])
  const takenOfferIds = useMemo(
    () => goals.data?.map((goal) => goal.ofertaAcademicaId) ?? [],
    [goals.data],
  )

  const confirmRemoval = async () => {
    if (!goalToRemove) return
    setRemoving(true)
    try {
      await goalService.remove(goalToRemove.id)
      notify.success(`Quitamos ${goalToRemove.carrera} de tus metas`)
      setGoalToRemove(null)
      goals.retry()
    } catch (error) {
      notify.error(error)
    } finally {
      setRemoving(false)
    }
  }

  return (
    <Page>
      <PageHeader
        title="Progreso"
        description="Qué tan cerca estás de tu meta, cómo cambia tu puntaje proyectado y cuánto dominas cada tema."
        actions={
          <>
            <Link to={paths.careers} className={buttonStyles('secondary')}>
              Explorar carreras
            </Link>
            <Button onClick={() => setAdding(true)}>
              <Plus aria-hidden className="size-4" />
              Agregar meta
            </Button>
          </>
        }
      />

      <section aria-labelledby="goals-title" className="space-y-4">
        <h2 id="goals-title" className="text-xl font-bold">
          Tus metas
        </h2>
        {goals.loading && !goals.data ? (
          <SkeletonList rows={2} label="Cargando tus metas…" />
        ) : goals.error ? (
          <InlineError message={goals.error.message} onRetry={goals.retry} />
        ) : goals.data?.length === 0 ? (
          <EmptyState
            icon={Target}
            title="Aún no eliges tu carrera meta"
            message="Elige a qué carrera postulas para comparar tus simulacros con el puntaje de su último ingresante."
            action={<Button onClick={() => setAdding(true)}>Agregar meta</Button>}
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {goals.data?.map((goal) => (
              <GoalCard key={goal.id} goal={goal} onRemove={setGoalToRemove} />
            ))}
          </div>
        )}
      </section>

      <Card aria-labelledby="history-title" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="space-y-0.5">
            <h2 id="history-title" className="text-lg font-bold">
              Evolución de tu puntaje proyectado
            </h2>
            <p className="text-sm text-ink-muted">
              Diagnóstico y simulacros completos, frente al último ingresante.
            </p>
          </div>
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
          <ProFeatureNotice message="Con PRO ves cómo cambia tu puntaje proyectado en cada simulacro completo." />
        ) : history.error ? (
          <InlineError message={history.error.message} onRetry={history.retry} />
        ) : !historyGoal ? (
          <p className="text-ink-muted">Agrega una carrera meta para ver tu evolución.</p>
        ) : fullExams.length > 0 ? (
          <ScoreHistoryChart history={fullExams} cutoff={historyGoal.puntajeUltimoIngresante} />
        ) : (
          <NoResultsYet message="Tu diagnóstico y tus simulacros completos de esta área aparecerán aquí." />
        )}
      </Card>

      <Card aria-labelledby="mastery-title" className="space-y-4">
        <div className="space-y-0.5">
          <h2 id="mastery-title" className="text-lg font-bold">
            Aciertos por tema
          </h2>
          <p className="text-sm text-ink-muted">
            Todos tus simulacros, del tema que más te cuesta al que mejor dominas.
          </p>
        </div>
        {mastery.loading && !mastery.data ? (
          <Skeleton className="h-64 w-full" />
        ) : mastery.error?.kind === 'forbidden' ? (
          <ProFeatureNotice message="Con PRO ves en qué temas aciertas más y cuáles debes reforzar." />
        ) : mastery.error ? (
          <InlineError message={mastery.error.message} onRetry={mastery.retry} />
        ) : mastery.data && mastery.data.length > 0 ? (
          <TopicMasteryList topics={mastery.data} />
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
        title="¿Quitar esta meta?"
        message={
          goalToRemove
            ? `Dejarás de seguir ${goalToRemove.carrera} (${goalToRemove.universidad}). Puedes volver a agregarla cuando quieras.`
            : ''
        }
        confirmLabel="Quitar meta"
        confirmVariant="danger"
        loading={removing}
        onConfirm={confirmRemoval}
        onCancel={() => setGoalToRemove(null)}
      />
    </Page>
  )
}
