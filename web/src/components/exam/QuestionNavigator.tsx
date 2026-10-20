interface QuestionNavigatorProps {
  answered: boolean[]
  current: number
  onSelect: (position: number) => void
}

export function QuestionNavigator({ answered, current, onSelect }: QuestionNavigatorProps) {
  return (
    <nav
      aria-label="Preguntas del simulacro"
      className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
    >
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
                  ? 'bg-indigo-600 text-white hover:bg-indigo-500'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700'
              } ${position === current ? 'ring-2 ring-amber-400 ring-offset-1' : ''}`}
            >
              {position + 1}
            </button>
          </li>
        ))}
      </ol>
    </nav>
  )
}
