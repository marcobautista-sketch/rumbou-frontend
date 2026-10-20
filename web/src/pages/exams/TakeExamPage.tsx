import { Timer } from 'lucide-react'
import { useCallback, useState } from 'react'
import { generatePath, Navigate, useNavigate, useParams, useSearchParams } from 'react-router'
import { examService } from '../../api/examService'
import { QuestionCard } from '../../components/exam/QuestionCard'
import { QuestionNavigator } from '../../components/exam/QuestionNavigator'
import { ErrorScreen } from '../../components/feedback/ErrorScreen'
import { PageLoader } from '../../components/feedback/PageLoader'
import { Button } from '../../components/ui/Button'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { useElapsedSeconds } from '../../hooks/useElapsedSeconds'
import { useFetch } from '../../hooks/useFetch'
import { paths } from '../../routes/paths'
import type { ExamDetail } from '../../types/exam'
import { examTypeLabels } from '../../utils/examSummary'
import { formatDuration } from '../../utils/format'
import { notify } from '../../utils/notify'

function ExamInProgress({ exam }: { exam: ExamDetail }) {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [changes, setChanges] = useState<Record<number, number | null>>({})
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [finishing, setFinishing] = useState(false)
  const elapsedSeconds = useElapsedSeconds(exam.fechaInicio)

  const total = exam.preguntas.length
  const requested = Number.parseInt(searchParams.get('pregunta') ?? '1', 10)
  const index = Math.min(Math.max(Number.isNaN(requested) ? 1 : requested, 1), total) - 1
  const question = exam.preguntas[index]
  const answers = exam.preguntas.map((item) =>
    item.preguntaId in changes ? changes[item.preguntaId] : item.alternativaMarcada,
  )
  const answeredCount = answers.filter((answer) => answer !== null).length

  const goTo = (position: number) =>
    setSearchParams({ pregunta: String(position + 1) }, { replace: true })

  const answer = async (alternative: number | null) => {
    const previous = answers[index]
    setChanges((current) => ({ ...current, [question.preguntaId]: alternative }))
    try {
      await examService.answer(exam.id, question.preguntaId, alternative)
    } catch (error) {
      setChanges((current) => ({ ...current, [question.preguntaId]: previous }))
      notify.error(error)
    }
  }

  const finish = async () => {
    setFinishing(true)
    try {
      await examService.finish(exam.id)
      notify.success('¡Terminaste el simulacro! Este es tu resultado.')
      navigate(generatePath(paths.examResult, { examId: String(exam.id) }), { replace: true })
    } catch (error) {
      notify.error(error)
      setFinishing(false)
      setConfirmOpen(false)
    }
  }

  const unanswered = total - answeredCount

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{examTypeLabels[exam.tipo]}</p>
          <h1 className="text-2xl font-bold">
            Pregunta {index + 1} de {total}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <span
            className="flex items-center gap-2 font-mono text-lg"
            aria-label="Tiempo transcurrido"
          >
            <Timer aria-hidden className="size-5 text-indigo-600 dark:text-indigo-400" />
            {formatDuration(elapsedSeconds)}
          </span>
          <Button onClick={() => setConfirmOpen(true)}>Finalizar</Button>
        </div>
      </header>

      <div
        role="progressbar"
        aria-label="Preguntas respondidas"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={answeredCount}
        className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"
      >
        <div
          className="h-full bg-indigo-600 transition-all"
          style={{ width: `${(answeredCount / total) * 100}%` }}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_17rem]">
        <QuestionCard
          question={question}
          position={index + 1}
          selected={answers[index]}
          onSelect={answer}
        />
        <QuestionNavigator
          answered={answers.map((item) => item !== null)}
          current={index}
          onSelect={goTo}
        />
      </div>

      <nav aria-label="Moverse entre preguntas" className="flex flex-wrap justify-between gap-3">
        <Button variant="secondary" disabled={index === 0} onClick={() => goTo(index - 1)}>
          Anterior
        </Button>
        <Button variant="ghost" disabled={answers[index] === null} onClick={() => answer(null)}>
          Dejar en blanco
        </Button>
        <Button disabled={index === total - 1} onClick={() => goTo(index + 1)}>
          Siguiente
        </Button>
      </nav>

      <ConfirmDialog
        open={confirmOpen}
        title="¿Finalizar el simulacro?"
        message={
          unanswered > 0
            ? `Te faltan ${unanswered} de ${total} preguntas. Las que dejes en blanco no suman ni restan.`
            : 'Respondiste todas las preguntas. Ya puedes ver tu resultado.'
        }
        confirmLabel="Finalizar"
        loading={finishing}
        onConfirm={finish}
        onCancel={() => setConfirmOpen(false)}
      />
    </main>
  )
}

export default function TakeExamPage() {
  const examId = Number(useParams().examId)
  const fetchExam = useCallback(
    (signal: AbortSignal) => examService.getDetail(examId, signal),
    [examId],
  )
  const { data: exam, error, loading, retry } = useFetch(fetchExam)

  if (loading) return <PageLoader />
  if (error || !exam) {
    return (
      <ErrorScreen
        title="No pudimos abrir el simulacro"
        message={error?.message ?? 'Intenta de nuevo.'}
        onRetry={retry}
      />
    )
  }
  if (exam.estado === 'FINALIZADO') {
    return <Navigate to={generatePath(paths.examResult, { examId: String(exam.id) })} replace />
  }
  return <ExamInProgress exam={exam} />
}
