import {
  ArrowRight,
  Flag,
  LoaderCircle,
  NotebookPen,
  Play,
  Target,
  type LucideIcon,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { generatePath, Link } from 'react-router'
import { paths } from '../../routes/paths'
import type { ExamSummary } from '../../types/exam'
import type { TopicMastery } from '../../types/progress'
import { examTypeLabels } from '../../utils/examSummary'
import { formatLongDate } from '../../utils/format'
import { Card } from '../ui/Card'
import { Skeleton } from '../ui/Skeleton'

// Lo más útil que puede hacer el postulante ahora, en orden: elegir meta, terminar lo que
// dejó a medias, medir su punto de partida o practicar su tema más débil.
export type NextStep =
  | { kind: 'goal' }
  | { kind: 'resume'; exam: ExamSummary }
  | { kind: 'diagnostic' }
  | { kind: 'topic'; topic: TopicMastery; canStart: boolean }
  | { kind: 'practice' }

interface NextStepCardProps {
  step: NextStep | null
  starting: boolean
  onPractice: (topicId: number) => void
}

function Content({
  icon: Icon,
  title,
  text,
  action,
}: {
  icon: LucideIcon
  title: string
  text: string
  action: ReactNode
}) {
  return (
    <>
      <span className="w-fit rounded-xl bg-on-primary/15 p-2.5">
        <Icon aria-hidden className="size-6" />
      </span>
      <div className="space-y-1.5">
        <p className="text-sm font-semibold opacity-80">Tu siguiente paso</p>
        <h2 className="text-xl leading-snug font-bold">{title}</h2>
        <p className="opacity-85">{text}</p>
      </div>
      <div className="mt-auto pt-2">{action}</div>
    </>
  )
}

const actionStyles =
  'inline-flex min-h-11 items-center gap-2 rounded-xl bg-on-primary px-5 py-2.5 font-semibold text-primary transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-primary disabled:opacity-70'

export function NextStepCard({ step, starting, onPractice }: NextStepCardProps) {
  if (!step) {
    return (
      <Card className="space-y-4">
        <Skeleton className="h-10 w-10" />
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-full" />
      </Card>
    )
  }

  let content: ReactNode
  switch (step.kind) {
    case 'goal':
      content = (
        <Content
          icon={Flag}
          title="Elige tu carrera meta"
          text="Así comparamos cada simulacro con el puntaje del último ingresante."
          action={
            <Link to={paths.careers} className={actionStyles}>
              Ver carreras
              <ArrowRight aria-hidden className="size-4" />
            </Link>
          }
        />
      )
      break
    case 'resume':
      content = (
        <Content
          icon={Play}
          title={`Termina tu ${examTypeLabels[step.exam.tipo].toLowerCase()}`}
          text={`Lo empezaste el ${formatLongDate(step.exam.fechaInicio)}. Tus respuestas están guardadas.`}
          action={
            <Link
              to={generatePath(paths.exam, { examId: String(step.exam.id) })}
              className={actionStyles}
            >
              Continuar
              <ArrowRight aria-hidden className="size-4" />
            </Link>
          }
        />
      )
      break
    case 'diagnostic':
      content = (
        <Content
          icon={Target}
          title="Rinde tu diagnóstico"
          text="Un simulacro completo mide tu punto de partida en cada tema del examen."
          action={
            <Link to={`${paths.newExam}?tipo=DIAGNOSTICO`} className={actionStyles}>
              Empezar diagnóstico
              <ArrowRight aria-hidden className="size-4" />
            </Link>
          }
        />
      )
      break
    case 'topic':
      content = (
        <Content
          icon={NotebookPen}
          title={`Practica ${step.topic.tema}`}
          text={`Es tu tema con menos aciertos (${Math.round(step.topic.porcentajeAciertos)} %). Un simulacro por tema es la forma más rápida de mejorarlo.`}
          action={
            step.canStart ? (
              <button
                type="button"
                onClick={() => onPractice(step.topic.temaId)}
                disabled={starting}
                aria-busy={starting}
                className={actionStyles}
              >
                {starting && <LoaderCircle aria-hidden className="size-4 animate-spin" />}
                {starting ? 'Preparando…' : `Practicar ${step.topic.tema}`}
              </button>
            ) : (
              <Link to={paths.newExam} className={actionStyles}>
                Elegir simulacro
                <ArrowRight aria-hidden className="size-4" />
              </Link>
            )
          }
        />
      )
      break
    case 'practice':
      content = (
        <Content
          icon={NotebookPen}
          title="Practica por tema"
          text="Refuerza un tema a la vez y mide tu avance en tu próximo simulacro completo."
          action={
            <Link to={paths.newExam} className={actionStyles}>
              Elegir tema
              <ArrowRight aria-hidden className="size-4" />
            </Link>
          }
        />
      )
      break
  }

  return (
    <section
      aria-label="Tu siguiente paso"
      className="flex h-full flex-col gap-4 rounded-2xl bg-primary p-6 text-on-primary shadow-card"
    >
      {content}
    </section>
  )
}
