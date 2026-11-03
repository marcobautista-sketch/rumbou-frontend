interface QuestionNavigatorProps {
  answered: boolean[]
  current: number
  onSelect: (position: number) => void
}

// La hoja de respuestas: cada casilla es una pregunta, marcada en azul lapicero cuando ya
// tiene respuesta.
export function QuestionNavigator({ answered, current, onSelect }: QuestionNavigatorProps) {
  const answeredCount = answered.filter(Boolean).length

  return (
    <nav
      aria-label="Hoja de respuestas"
      className="space-y-4 rounded-2xl bg-surface p-5 shadow-card lg:sticky lg:top-6"
    >
      <div className="space-y-0.5">
        <h2 className="font-bold">Hoja de respuestas</h2>
        <p className="text-sm text-ink-muted">
          {answeredCount} de {answered.length} respondidas
        </p>
      </div>
      <ol className="grid max-h-80 grid-cols-8 gap-1.5 overflow-y-auto p-0.5 sm:grid-cols-10 lg:grid-cols-6">
        {answered.map((isAnswered, position) => (
          <li key={position}>
            <button
              type="button"
              onClick={() => onSelect(position)}
              aria-current={position === current ? 'step' : undefined}
              aria-label={`Pregunta ${position + 1}${isAnswered ? ', respondida' : ''}`}
              className={`size-9 rounded-lg text-sm font-semibold tabular-nums transition ${
                isAnswered
                  ? 'bg-primary text-on-primary hover:bg-primary-hover'
                  : 'border border-line bg-surface hover:bg-chip'
              } ${position === current ? 'ring-2 ring-accent ring-offset-2 ring-offset-surface' : ''}`}
            >
              {position + 1}
            </button>
          </li>
        ))}
      </ol>
      <ul aria-hidden className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-muted">
        <li className="flex items-center gap-1.5">
          <span className="size-3 rounded bg-primary" />
          Respondida
        </li>
        <li className="flex items-center gap-1.5">
          <span className="size-3 rounded border border-line" />
          Sin responder
        </li>
        <li className="flex items-center gap-1.5">
          <span className="size-3 rounded ring-2 ring-accent" />
          Actual
        </li>
      </ul>
    </nav>
  )
}
