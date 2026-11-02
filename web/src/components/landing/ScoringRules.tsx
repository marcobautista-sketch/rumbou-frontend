interface ScoringBlock {
  name: string
  correct: string
  wrong: string
  points: string
}

interface UniversityScoring {
  name: string
  short: string
  summary: string
  blocks: ScoringBlock[]
}

// Reglas de los prospectos de admisión, las mismas que usa el backend para calificar
// (seed/esquemas.csv). Las preguntas en blanco no suman ni restan.
const universities: UniversityScoring[] = [
  {
    name: 'Universidad Nacional de Ingeniería',
    short: 'UNI',
    summary: '180 preguntas · 1,800 puntos',
    blocks: [
      { name: 'Aptitud Académica y Humanidades', correct: '+6', wrong: '−1.2', points: '600' },
      { name: 'Matemática', correct: '+15', wrong: '−3', points: '600' },
      { name: 'Física y Química', correct: '+15', wrong: '−3', points: '600' },
    ],
  },
  {
    name: 'Universidad Nacional Mayor de San Marcos',
    short: 'San Marcos',
    summary: '100 preguntas · 2,000 puntos',
    blocks: [
      { name: 'Actitudinal', correct: '+20', wrong: '0', points: '200' },
      { name: 'Habilidades', correct: '+20', wrong: '−1.125', points: '400' },
      { name: 'Conocimientos', correct: '+20', wrong: '−1.125', points: '1,400' },
    ],
  },
]

export function ScoringRules() {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {universities.map((university) => (
        <article
          key={university.short}
          className="rounded-2xl border border-line bg-surface p-5 shadow-card sm:p-6"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h3 className="text-lg font-bold">{university.short}</h3>
            <p className="text-sm text-ink-muted">{university.summary}</p>
          </div>
          <p className="text-sm text-ink-muted">{university.name}</p>
          <table className="mt-4 w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs tracking-wide text-ink-muted uppercase">
                <th scope="col" className="py-2 pr-2 font-semibold">
                  Bloque
                </th>
                <th scope="col" className="px-2 py-2 text-right font-semibold">
                  Correcta
                </th>
                <th scope="col" className="px-2 py-2 text-right font-semibold">
                  Incorrecta
                </th>
                <th scope="col" className="py-2 pl-2 text-right font-semibold">
                  Máximo
                </th>
              </tr>
            </thead>
            <tbody>
              {university.blocks.map((block) => (
                <tr key={block.name} className="border-b border-line last:border-0">
                  <th scope="row" className="py-2.5 pr-2 text-left font-medium">
                    {block.name}
                  </th>
                  <td className="px-2 py-2.5 text-right font-semibold text-success tabular-nums">
                    {block.correct}
                  </td>
                  <td
                    className={`px-2 py-2.5 text-right font-semibold tabular-nums ${
                      block.wrong === '0' ? 'text-ink-muted' : 'text-danger'
                    }`}
                  >
                    {block.wrong}
                  </td>
                  <td className="py-2.5 pl-2 text-right tabular-nums">{block.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
      ))}
    </div>
  )
}
