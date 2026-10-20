interface QuestionNavigatorProps {
  answered: boolean[]
  current: number
  onSelect: (position: number) => void
}

export function QuestionNavigator({ answered, current, onSelect }: QuestionNavigatorProps) {
  return (
    <nav aria-label="Preguntas del simulacro" className="rounded-2xl bg-surface p-4 shadow-card">
      <ol className="grid max-h-80 grid-cols-8 gap-1.5 overflow-y-auto sm:grid-cols-10 lg:grid-cols-6">
        {answered.map((isAnswered, position) => (
          <li key={position}>
            <button
              type="button"
              onClick={() => onSelect(position)}
              aria-current={position === current ? 'step' : undefined}
              aria-label={`Pregunta ${position + 1}${isAnswered ? ', respondida' : ''}`}
              className={`size-9 rounded-lg text-sm font-medium transition ${
                isAnswered
                  ? 'bg-accent text-on-accent hover:brightness-95'
                  : 'bg-surface-muted hover:bg-chip'
              } ${position === current ? 'ring-2 ring-primary ring-offset-2 ring-offset-surface' : ''}`}
            >
              {position + 1}
            </button>
          </li>
        ))}
      </ol>
    </nav>
  )
}
