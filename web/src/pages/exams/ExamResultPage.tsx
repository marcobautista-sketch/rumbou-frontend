import { CircleCheck, CircleSlash, CircleX, GraduationCap, ListChecks } from 'lucide-react'
import { useCallback, useMemo } from 'react'
import { generatePath, Link, Navigate, useParams } from 'react-router'
import { examService } from '../../api/examService'
import { QuestionReviewList } from '../../components/exam/QuestionReviewList'
import { StudyPlan } from '../../components/exam/StudyPlan'
import { ErrorScreen } from '../../components/feedback/ErrorScreen'
import { PageLoader } from '../../components/feedback/PageLoader'
import { buttonStyles } from '../../components/ui/buttonStyles'
import { useFetch } from '../../hooks/useFetch'
import { paths } from '../../routes/paths'
import { examTypeLabels, summarizeExam } from '../../utils/examSummary'

const cardStyles = 'rounded-2xl bg-surface p-6 shadow-card'

export default function ExamResultPage() {
  const examId = Number(useParams().examId)
  const fetchExam = useCallback(
    (signal: AbortSignal) => examService.getDetail(examId, signal),
    [examId],
  )
  const { data: exam, error, loading, retry } = useFetch(fetchExam)
  const summary = useMemo(() => (exam ? summarizeExam(exam.preguntas) : null), [exam])

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

  const stats = [
    { label: 'Correctas', value: summary.correct, Icon: CircleCheck, color: 'text-success' },
    { label: 'Incorrectas', value: summary.incorrect, Icon: CircleX, color: 'text-danger' },
    { label: 'En blanco', value: summary.blank, Icon: CircleSlash, color: 'text-ink-muted' },
  ]

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-10">
      <header className="space-y-1">
        <p className="text-sm text-ink-muted">{examTypeLabels[exam.tipo]}</p>
        <h1 className="text-2xl font-bold">Tu resultado</h1>
      </header>

      <section aria-label="Puntaje" className={`${cardStyles} grid gap-6 sm:grid-cols-2`}>
        <div>
          <p className="text-sm text-ink-muted">Puntaje obtenido</p>
          <p className="text-4xl font-bold text-primary">
            {exam.puntajeObtenido?.toFixed(2) ?? '—'}
          </p>
        </div>
        <div>
          <p className="text-sm text-ink-muted">Puntaje simulado proyectado (PSP)</p>
          <p className="text-4xl font-bold">{exam.psp?.toFixed(2) ?? '—'}</p>
        </div>
      </section>

      <section aria-label="Respuestas" className="grid gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, Icon, color }) => (
          <div key={label} className={`${cardStyles} flex items-center gap-3`}>
            <Icon aria-hidden className={`size-8 ${color}`} />
            <div>
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-sm text-ink-muted">{label}</p>
            </div>
          </div>
        ))}
      </section>

      <section aria-labelledby="study-plan-title" className={`${cardStyles} space-y-4`}>
        <header className="space-y-1">
          <h2 id="study-plan-title" className="flex items-center gap-2 text-lg font-semibold">
            <GraduationCap aria-hidden className="size-5" />
            Tu plan de estudio
          </h2>
          <p className="text-sm text-ink-muted">
            Los temas donde más fallaste, con clases en video y libros para repasarlos.
          </p>
        </header>
        <StudyPlan topics={summary.weakTopics} />
      </section>

      <section aria-labelledby="review-title" className="space-y-3">
        <h2 id="review-title" className="flex items-center gap-2 text-lg font-semibold">
          <ListChecks aria-hidden className="size-5" />
          Revisión pregunta por pregunta
        </h2>
        <QuestionReviewList questions={exam.preguntas} />
      </section>

      <Link to={paths.newExam} className={buttonStyles('primary')}>
        Rendir otro simulacro
      </Link>
    </main>
  )
}
