import { Keyboard, Timer } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { generatePath, Navigate, useNavigate, useParams, useSearchParams } from 'react-router'
import { areaService } from '../../api/areaService'
import { examService } from '../../api/examService'
import { QuestionCard } from '../../components/exam/QuestionCard'
import { QuestionNavigator } from '../../components/exam/QuestionNavigator'
import { ErrorScreen } from '../../components/feedback/ErrorScreen'
import { PageLoader } from '../../components/feedback/PageLoader'
import { Page } from '../../components/layout/Page'
import { Button } from '../../components/ui/Button'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { useElapsedSeconds } from '../../hooks/useElapsedSeconds'
import { useFetch } from '../../hooks/useFetch'
import { paths } from '../../routes/paths'
import type { ExamDetail } from '../../types/exam'
import { examTypeLabels } from '../../utils/examSummary'
import { alternativeLetter, formatDuration } from '../../utils/format'
import { notify } from '../../utils/notify'
import { areaLabel } from '../../utils/universityLabels'

const LETTERS = ['a', 'b', 'c', 'd', 'e']

function ExamInProgress({ exam, examName }: { exam: ExamDetail; examName: string }) {
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
  const isLast = index === total - 1

  // Atajos de teclado: A–E marcan una alternativa y las flechas cambian de pregunta. No se
  // activan mientras se escribe ni con el diálogo de finalizar abierto.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (confirmOpen || event.altKey || event.ctrlKey || event.metaKey) return
      const target = event.target as HTMLElement
      if (target.closest('textarea, select, input:not([type="radio"])')) return
      const letter = LETTERS.indexOf(event.key.toLowerCase())
      if (letter >= 0 && letter < question.alternativas.length) {
        event.preventDefault()
        void answer(letter)
      } else if (target.tagName !== 'INPUT' && event.key === 'ArrowRight' && !isLast) {
        goTo(index + 1)
      } else if (target.tagName !== 'INPUT' && event.key === 'ArrowLeft' && index > 0) {
        goTo(index - 1)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  return (
    <Page>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-primary">
            {examTypeLabels[exam.tipo]}
            {examName && ` · ${examName}`}
          </p>
          <h1 className="text-[1.75rem] leading-tight font-bold tracking-tight sm:text-3xl">
            Pregunta {index + 1} <span className="text-ink-muted">de {total}</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="flex items-center gap-2 rounded-xl bg-surface px-3 py-2 font-mono text-lg font-semibold tabular-nums shadow-card"
            aria-label="Tiempo transcurrido"
          >
            <Timer aria-hidden className="size-5 text-primary" />
            {formatDuration(elapsedSeconds)}
          </span>
          <Button variant="secondary" onClick={() => setConfirmOpen(true)}>
            Finalizar
          </Button>
        </div>
      </header>

      <div
        role="progressbar"
        aria-label="Preguntas respondidas"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={answeredCount}
        className="h-2 overflow-hidden rounded-full bg-surface-muted"
      >
        <div
          className="h-full rounded-full bg-accent transition-all"
          style={{ width: `${(answeredCount / total) * 100}%` }}
        />
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="space-y-5">
          <QuestionCard
            question={question}
            position={index + 1}
            selected={answers[index]}
            onSelect={answer}
          />
          <nav
            aria-label="Moverse entre preguntas"
            className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 sm:gap-3"
          >
            <Button variant="secondary" disabled={index === 0} onClick={() => goTo(index - 1)}>
              Anterior
            </Button>
            <Button variant="ghost" disabled={answers[index] === null} onClick={() => answer(null)}>
              <span className="sm:hidden">En blanco</span>
              <span className="hidden sm:inline">Dejar en blanco</span>
            </Button>
            {isLast ? (
              <Button onClick={() => setConfirmOpen(true)}>Finalizar simulacro</Button>
            ) : (
              <Button onClick={() => goTo(index + 1)}>Siguiente</Button>
            )}
          </nav>
          <p className="hidden items-center gap-2 text-sm text-ink-muted lg:flex">
            <Keyboard aria-hidden className="size-4" />
            Atajos: {alternativeLetter(0)}–{alternativeLetter(question.alternativas.length - 1)}{' '}
            marcan una alternativa y las flechas ← → cambian de pregunta.
          </p>
        </div>
        <QuestionNavigator
          answered={answers.map((item) => item !== null)}
          current={index}
          onSelect={goTo}
        />
      </div>

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
    </Page>
  )
}

export default function TakeExamPage() {
  const examId = Number(useParams().examId)
  const fetchExam = useCallback(
    (signal: AbortSignal) => examService.getDetail(examId, signal),
    [examId],
  )
  const { data: exam, error, loading, retry } = useFetch(fetchExam)
  const fetchAreas = useCallback((signal: AbortSignal) => areaService.list(signal), [])
  const areas = useFetch(fetchAreas)

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
  const area = areas.data?.find((candidate) => candidate.id === exam.areaId)
  return (
    <ExamInProgress exam={exam} examName={area ? areaLabel(area.universidad, area.nombre) : ''} />
  )
}
