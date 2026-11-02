import type { SolutionStep } from '../../types/presentation'
import { MathText } from './MathText'

function StepTable({ rows }: { rows: string[][] }) {
  const [header, ...body] = rows
  return (
    <div className="mt-2 overflow-x-auto rounded-xl border border-line">
      <table className="w-full text-left">
        <thead className="bg-surface-muted text-xs font-semibold tracking-wide text-ink-muted uppercase">
          <tr>
            {header.map((cell, index) => (
              <th key={index} scope="col" className="px-3 py-2">
                <MathText text={cell} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-t border-line">
              {row.map((cell, index) => (
                <td key={index} className="px-3 py-2 whitespace-nowrap">
                  <MathText text={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// La resolución en pasos numerados: un título corto, el detalle con sus fórmulas y una tabla opcional.
export function SolutionSteps({ steps }: { steps: SolutionStep[] }) {
  return (
    <ol className="space-y-4">
      {steps.map((step, index) => (
        <li key={index} className="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-3">
          <span
            aria-hidden
            className="flex size-7 items-center justify-center rounded-full bg-primary font-display text-sm font-bold text-on-primary"
          >
            {index + 1}
          </span>
          <div className="space-y-1">
            <p className="font-display font-semibold">
              <MathText text={step.titulo} />
            </p>
            <p className="leading-relaxed">
              <MathText text={step.detalle} />
            </p>
            {step.tabla && step.tabla.length > 1 && <StepTable rows={step.tabla} />}
          </div>
        </li>
      ))}
    </ol>
  )
}
