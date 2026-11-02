import { CircleCheck, CircleX, RotateCcw } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { alternativeLetter } from '../../utils/format'
import { MathText } from '../questions/MathText'
import { QuestionStatement } from '../questions/QuestionStatement'
import { SolutionSteps } from '../questions/SolutionSteps'
import { Button } from '../ui/Button'
import { sampleQuestion as question } from './sampleQuestionData'

// Monta las fórmulas recién cuando la sección se acerca a la pantalla: MathJax pesa y la
// mayoría de visitas no baja hasta aquí.
function useNearViewport() {
  const ref = useRef<HTMLDivElement>(null)
  const [near, setNear] = useState(false)
  useEffect(() => {
    const element = ref.current
    if (!element || near) return
    const observer = new IntersectionObserver(([entry]) => entry.isIntersecting && setNear(true), {
      rootMargin: '400px',
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [near])
  return { ref, near }
}

// Una pregunta de muestra que se puede responder: al comprobar, marca la clave y muestra la
// resolución en pasos, igual que en un simulacro terminado.
export function SampleQuestion() {
  const { ref, near } = useNearViewport()
  const [selected, setSelected] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  const correct = selected === question.claveCorrecta

  const reset = () => {
    setSelected(null)
    setChecked(false)
  }

  return (
    <div ref={ref} className="rounded-2xl border border-line bg-surface p-5 shadow-card sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="rounded-full bg-chip px-3 py-1 text-sm font-semibold text-primary">
          {question.tema} · Fácil
        </span>
        <span className="text-sm text-ink-muted">Pregunta del banco de RumboU</span>
      </div>

      {near ? (
        <div className="mt-5 space-y-5">
          <QuestionStatement question={question} className="text-lg leading-relaxed" />
          <fieldset>
            <legend className="sr-only">Alternativas</legend>
            <div className="grid grid-cols-5 gap-2">
              {question.alternativas.map((text, index) => {
                const isKey = checked && index === question.claveCorrecta
                const isWrong = checked && index === selected && !correct
                return (
                  <label
                    key={index}
                    className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 px-2 py-3 transition has-focus-visible:ring-2 has-focus-visible:ring-accent ${
                      isKey
                        ? 'border-success bg-success-soft'
                        : isWrong
                          ? 'border-danger bg-danger-soft'
                          : 'border-line hover:bg-surface-muted has-checked:border-primary has-checked:bg-chip'
                    } ${checked ? 'pointer-events-none' : ''}`}
                  >
                    <input
                      type="radio"
                      name="sample-question"
                      checked={selected === index}
                      onChange={() => setSelected(index)}
                      disabled={checked}
                      className="sr-only"
                    />
                    <span className="text-xs font-semibold text-ink-muted">
                      {alternativeLetter(index)}
                    </span>
                    <MathText text={question.presentacion.alternativas[index]} fallback={text} />
                  </label>
                )
              })}
            </div>
          </fieldset>

          {checked ? (
            <div className="space-y-5 border-t border-line pt-5">
              <p
                role="status"
                className={`flex items-center gap-2 font-semibold ${correct ? 'text-success' : 'text-danger'}`}
              >
                {correct ? (
                  <CircleCheck aria-hidden className="size-5" />
                ) : (
                  <CircleX aria-hidden className="size-5" />
                )}
                {correct
                  ? '¡Correcto! Así se resuelve:'
                  : `La respuesta es la ${alternativeLetter(question.claveCorrecta)}. Así se resuelve:`}
              </p>
              <SolutionSteps steps={question.pasos} />
              <Button variant="ghost" size="sm" onClick={reset}>
                <RotateCcw aria-hidden className="size-4" />
                Intentar de nuevo
              </Button>
            </div>
          ) : (
            <Button onClick={() => setChecked(true)} disabled={selected === null}>
              Comprobar respuesta
            </Button>
          )}
        </div>
      ) : (
        <div className="mt-5 h-80" />
      )}
    </div>
  )
}
