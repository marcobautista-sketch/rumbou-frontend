import { formatScore } from '../../utils/format'
import { scoringRules, type UniversityScoring } from '../../utils/scoringRules'
import { universityShort } from '../../utils/universityLabels'

// Tabla de bloques de una universidad: cuánto suma una correcta, cuánto resta una incorrecta y
// el máximo de cada bloque. La usan la portada y, en versión compacta, el formulario de nuevo
// simulacro. En celulares la versión normal usa los mismos títulos cortos para caber sin cortarse.
export function ScoringTable({
  rules,
  compact = false,
}: {
  rules: UniversityScoring
  compact?: boolean
}) {
  const heading = (full: string, short: string) =>
    compact ? (
      short
    ) : (
      <>
        <span className="sm:hidden">{short}</span>
        <span className="hidden sm:inline">{full}</span>
      </>
    )

  return (
    <table className={`w-full ${compact ? 'text-xs' : 'text-sm'}`}>
      <thead>
        <tr className="border-b border-line text-left text-xs tracking-wide text-ink-muted uppercase">
          <th scope="col" className="py-2 pr-1.5 sm:pr-2 font-semibold">
            Bloque
          </th>
          <th scope="col" className="px-1.5 sm:px-2 py-2 text-right font-semibold">
            {heading('Correcta', 'Acierto')}
          </th>
          <th scope="col" className="px-1.5 sm:px-2 py-2 text-right font-semibold">
            {heading('Incorrecta', 'Error')}
          </th>
          <th scope="col" className="py-2 pl-1.5 sm:pl-2 text-right font-semibold">
            {heading('Máximo', 'Máx.')}
          </th>
        </tr>
      </thead>
      <tbody>
        {rules.blocks.map((block) => (
          <tr key={block.name} className="border-b border-line last:border-0">
            <th scope="row" className="py-2.5 pr-1.5 sm:pr-2 text-left font-medium">
              {block.name}
            </th>
            <td className="px-1.5 sm:px-2 py-2.5 text-right font-semibold text-success tabular-nums">
              {block.correct}
            </td>
            <td
              className={`px-1.5 sm:px-2 py-2.5 text-right font-semibold tabular-nums ${
                block.wrong === '0' ? 'text-ink-muted' : 'text-danger'
              }`}
            >
              {block.wrong}
            </td>
            <td className="py-2.5 pl-1.5 sm:pl-2 text-right tabular-nums">{block.points}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export function ScoringRules() {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      {scoringRules.map((rules) => (
        <article
          key={rules.siglas}
          className="rounded-2xl border border-line bg-surface p-5 shadow-card sm:p-6"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h3 className="text-lg font-bold">{universityShort(rules.siglas)}</h3>
            <p className="text-sm text-ink-muted">
              {rules.questions} preguntas · {formatScore(rules.maxScore)} puntos
            </p>
          </div>
          <p className="text-sm text-ink-muted">{rules.name}</p>
          <div className="mt-4 overflow-x-auto">
            <ScoringTable rules={rules} />
          </div>
        </article>
      ))}
    </div>
  )
}
