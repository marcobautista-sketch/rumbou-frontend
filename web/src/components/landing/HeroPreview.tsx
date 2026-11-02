import { Flame, ListOrdered } from 'lucide-react'
import { QuestionFigure } from '../questions/QuestionFigure'
import { sampleQuestion } from './sampleQuestionData'

// Vista previa de la app para la portada: armada con los mismos componentes y colores,
// así se ve nítida y cambia con el modo oscuro. No usa fórmulas para no cargar MathJax arriba.
export function HeroPreview() {
  return (
    <div aria-hidden className="relative mx-auto w-full max-w-md select-none lg:max-w-none">
      <div className="relative z-10 rounded-2xl border border-line bg-surface p-5 shadow-raised sm:p-6">
        <p className="text-xs font-semibold tracking-wider text-ink-muted uppercase">Tu meta</p>
        <p className="mt-1 font-display text-lg font-bold">Ingeniería de Sistemas · UNI</p>
        <div className="mt-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs text-ink-muted">Tu puntaje proyectado</p>
            <p className="font-display text-3xl font-bold text-primary">1,259</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-ink-muted">Último ingresante</p>
            <p className="font-display text-xl font-bold">1,209</p>
          </div>
        </div>
        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-surface-muted">
          <div className="h-full w-full rounded-full bg-accent" />
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <span className="rounded-full bg-chip px-2.5 py-0.5 text-xs font-semibold text-primary">
            Zona de ingreso ajustada
          </span>
          <span className="text-xs text-ink-muted">104 % del último ingresante</span>
        </div>
      </div>

      <div className="relative z-20 -mt-4 ml-8 rounded-2xl border border-line bg-surface p-4 shadow-raised sm:ml-16 lg:-mt-6 lg:ml-24">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full bg-chip px-2.5 py-0.5 text-xs font-semibold text-primary">
            Geometría
          </span>
          <span className="text-xs text-ink-muted">Pregunta 12 de 40</span>
        </div>
        <div className="mt-3 grid grid-cols-[8.5rem_minmax(0,1fr)] items-center gap-4">
          <div className="[&_figcaption]:hidden [&_figure]:p-1.5">
            <QuestionFigure figure={sampleQuestion.presentacion.figura} />
          </div>
          <ol className="space-y-2 text-sm">
            {sampleQuestion.pasos.map((step, index) => (
              <li key={step.titulo} className="flex items-start gap-2">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[0.7rem] font-bold text-on-primary">
                  {index + 1}
                </span>
                <span className="font-medium">{step.titulo}</span>
              </li>
            ))}
            <li className="flex items-center gap-2 text-xs text-ink-muted">
              <ListOrdered className="size-4" />
              Resolución paso a paso
            </li>
          </ol>
        </div>
      </div>

      <div className="absolute -top-5 right-3 z-30 flex items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2 shadow-raised sm:-right-4">
        <span className="rounded-lg bg-warning-soft p-1.5 text-warning">
          <Flame className="size-4" />
        </span>
        <span className="text-sm font-semibold">12 días de racha</span>
      </div>
    </div>
  )
}
