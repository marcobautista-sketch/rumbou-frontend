import { GraduationCap, ListChecks, Timer } from 'lucide-react'
import { useCallback, useMemo } from 'react'
import { generatePath, Link, Navigate, useParams } from 'react-router'
import { areaService } from '../../api/areaService'
import { examService } from '../../api/examService'
import { goalService } from '../../api/goalService'
import { GoalProgress } from '../../components/dashboard/GoalProgress'
import { masteryBar } from '../../components/dashboard/masteryStyles'
import { QuestionReviewList } from '../../components/exam/QuestionReviewList'
import { StudyPlan } from '../../components/exam/StudyPlan'
import { ErrorScreen } from '../../components/feedback/ErrorScreen'
import { PageLoader } from '../../components/feedback/PageLoader'
import { Page } from '../../components/layout/Page'
import { PageHeader } from '../../components/layout/PageHeader'
import { buttonStyles } from '../../components/ui/buttonStyles'
import { Card } from '../../components/ui/Card'
import { useFetch } from '../../hooks/useFetch'
import { paths } from '../../routes/paths'
import { examTypeLabels, summarizeExam, topicResults } from '../../utils/examSummary'
import { formatDuration, formatLongDate, formatScore } from '../../utils/format'
import { masteryTone } from '../../utils/progressLabels'
import { scoringFor } from '../../utils/scoringRules'
import { areaLabel } from '../../utils/universityLabels'

export default function ExamResultPage() {
  const examId = Number(useParams().examId)
  const fetchExam = useCallback(
    (signal: AbortSignal) => examService.getDetail(examId, signal),
    [examId],
  )
  const fetchAreas = useCallback((signal: AbortSignal) => areaService.list(signal), [])
  const fetchGoals = useCallback((signal: AbortSignal) => goalService.list(signal), [])
  const { data: exam, error, loading, retry } = useFetch(fetchExam)
  const areas = useFetch(fetchAreas)
  const goals = useFetch(fetchGoals)
  const summary = useMemo(() => (exam ? summarizeExam(exam.preguntas) : null), [exam])
  const topics = useMemo(() => (exam ? topicResults(exam.preguntas) : []), [exam])

  if (loading) return <PageLoader />
  if (error || !exam || !summary) {
    return (
      <ErrorScreen
        title="No pudimos cargar tu resultado"
        message={error?.message ?? 'Intenta de nuevo.'}
        onRetry={retry}
      />
    )
  }
  if (exam.estado === 'EN_CURSO') {
    return <Navigate to={generatePath(paths.exam, { examId: String(exam.id) })} replace />
  }

  const area = areas.data?.find((candidate) => candidate.id === exam.areaId)
  const rules = scoringFor(area?.universidad)
  const goal = goals.data?.find((candidate) => candidate.areaId === exam.areaId) ?? null
  const fullExam = exam.tipo !== 'POR_TEMA'
  const total = exam.preguntas.length
  const accuracy = total ? Math.round((summary.correct / total) * 100) : 0
  const seconds =
    exam.fechaFin === null
      ? null
      : Math.max(
          0,
          Math.round(
            (new Date(exam.fechaFin).getTime() - new Date(exam.fechaInicio).getTime()) / 1000,
          ),
        )
  const details = [
    examTypeLabels[exam.tipo],
    area ? areaLabel(area.universidad, area.nombre) : null,
    exam.fechaFin ? formatLongDate(exam.fechaFin) : null,
  ]
    .filter(Boolean)
    .join(' · ')
  const answerParts = [
    { label: 'Correctas', value: summary.correct, bar: 'bg-success', text: 'text-success' },
    { label: 'Incorrectas', value: summary.incorrect, bar: 'bg-danger', text: 'text-danger' },
    { label: 'En blanco', value: summary.blank, bar: 'bg-line', text: 'text-ink-muted' },
  ]

  return (
    <Page>
      <PageHeader
        title="Tu resultado"
        description={details}
        breadcrumbs={[{ label: 'Simulacros', to: paths.examHistory }, { label: 'Resultado' }]}
        actions={
          <Link to={paths.newExam} className={buttonStyles('primary')}>
            Rendir otro simulacro
          </Link>
        }
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <Card aria-label="Puntaje" className="flex flex-col gap-5 lg:col-span-2">
          {fullExam ? (
            <>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-sm text-ink-muted">Tu puntaje</p>
                  <p className="font-display text-5xl font-bold tracking-tight text-primary tabular-nums">
                    {exam.puntajeObtenido === null ? '—' : formatScore(exam.puntajeObtenido)}
                    {rules && (
                      <span className="text-2xl text-ink-muted">
                        {' '}
                        / {formatScore(rules.maxScore)}
                      </span>
                    )}
                  </p>
                </div>
                {goal && (
                  <div className="text-right">
                    <p className="text-sm text-ink-muted">Último ingresante</p>
                    <p className="font-display text-2xl font-bold tabular-nums">
                      {formatScore(goal.puntajeUltimoIngresante)}
                    </p>
                  </div>
                )}
              </div>
              {goal && exam.psp !== null ? (
                <>
                  <GoalProgress score={exam.psp} cutoff={goal.puntajeUltimoIngresante} />
                  <p className="text-ink-muted">
                    {exam.psp >= goal.puntajeUltimoIngresante
                      ? `Con este resultado superas por ${formatScore(Math.round(exam.psp - goal.puntajeUltimoIngresante))} puntos al último ingresante de ${goal.carrera}.`
                      : `Con este resultado te faltan ${formatScore(Math.round(goal.puntajeUltimoIngresante - exam.psp))} puntos para alcanzar al último ingresante de ${goal.carrera}.`}
                  </p>
                </>
              ) : (
                <p className="text-ink-muted">
                  Elige una carrera meta de este examen para compararte con su último ingresante.{' '}
                  <Link to={paths.careers} className="font-semibold text-primary hover:underline">
                    Ver carreras
                  </Link>
                </p>
              )}
            </>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-ink-muted">
                    Puntaje en {topics[0]?.tema ?? 'el tema'}
                  </p>
                  <p className="font-display text-5xl font-bold tracking-tight text-primary tabular-nums">
                    {exam.puntajeObtenido === null ? '—' : formatScore(exam.puntajeObtenido)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-ink-muted">Aciertos</p>
                  <p className="font-display text-5xl font-bold tracking-tight tabular-nums">
                    {accuracy}%
                  </p>
                </div>
              </div>
              {exam.psp !== null && (
                <p className="rounded-xl bg-surface-muted p-4 text-sm text-ink-muted">
                  Si rindieras todo el examen con este nivel, tu puntaje proyectado sería{' '}
                  <strong className="text-ink">{formatScore(Math.round(exam.psp))}</strong>
                  {rules && ` de ${formatScore(rules.maxScore)}`}. Es una referencia: tu puntaje
                  proyectado oficial sale de los simulacros completos.
                </p>
              )}
            </>
          )}
        </Card>

        <Card aria-labelledby="answers-title" className="space-y-4">
          <div className="flex items-baseline justify-between gap-3">
            <h2 id="answers-title" className="font-bold">
              {total} preguntas
            </h2>
            {seconds !== null && (
              <span className="flex items-center gap-1.5 text-sm text-ink-muted">
                <Timer aria-hidden className="size-4" />
                {formatDuration(seconds)}
              </span>
            )}
          </div>
          <div className="flex h-3 overflow-hidden rounded-full bg-surface-muted">
            {answerParts.map((part) =>
              part.value > 0 ? (
                <div
                  key={part.label}
                  className={part.bar}
                  style={{ width: `${(part.value / total) * 100}%` }}
                />
              ) : null,
            )}
          </div>
          <dl className="space-y-2">
            {answerParts.map((part) => (
              <div key={part.label} className="flex items-center justify-between">
                <dt className="flex items-center gap-2 text-ink-muted">
                  <span className={`size-2.5 rounded-full ${part.bar}`} />
                  {part.label}
                </dt>
                <dd className={`font-display text-lg font-bold tabular-nums ${part.text}`}>
                  {part.value}
                </dd>
              </div>
            ))}
          </dl>
        </Card>
      </div>

      {topics.length > 1 && (
        <Card aria-labelledby="topics-title" className="space-y-4">
          <h2 id="topics-title" className="text-lg font-bold">
            Resultado por tema
          </h2>
          <ul className="grid gap-x-10 gap-y-4 md:grid-cols-2">
            {topics.map((topic) => {
              const percentage = Math.round((topic.correct / topic.total) * 100)
              return (
                <li key={topic.temaId} className="space-y-1.5">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="truncate font-medium">{topic.tema}</span>
                    <span className="text-sm text-ink-muted tabular-nums">
                      {topic.correct}/{topic.total}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
                    <div
                      className={`h-full rounded-full ${masteryBar[masteryTone(percentage)]}`}
                      style={{ width: `${Math.max(percentage, 2)}%` }}
                    />
                  </div>
                </li>
              )
            })}
          </ul>
        </Card>
      )}

      <Card aria-labelledby="study-plan-title" className="space-y-5">
        <header className="space-y-1">
          <h2 id="study-plan-title" className="flex items-center gap-2 text-lg font-bold">
            <GraduationCap aria-hidden className="size-5 text-primary" />
            Tu plan de estudio
          </h2>
          <p className="text-sm text-ink-muted">
            Los temas donde más fallaste, con clases en video y libros para repasarlos.
          </p>
        </header>
        <StudyPlan topics={summary.weakTopics} />
      </Card>

      <section aria-labelledby="review-title" className="space-y-4">
        <h2 id="review-title" className="flex items-center gap-2 text-lg font-bold">
          <ListChecks aria-hidden className="size-5 text-primary" />
          Revisión pregunta por pregunta
        </h2>
        <QuestionReviewList questions={exam.preguntas} />
      </section>
    </Page>
  )
}
