import { useMemo } from 'react'
import type { TopicMastery } from '../../types/progress'
import { masteryTone } from '../../utils/progressLabels'
import { masteryBar } from './masteryStyles'

interface TopicMasteryListProps {
  topics: TopicMastery[]
}

// Aciertos de cada tema, del que más cuesta al que mejor va: una barra por tema se lee más
// rápido que un gráfico y en el celular no corta los nombres.
export function TopicMasteryList({ topics }: TopicMasteryListProps) {
  const sorted = useMemo(
    () => [...topics].sort((a, b) => a.porcentajeAciertos - b.porcentajeAciertos),
    [topics],
  )

  return (
    <ul className="grid gap-x-10 gap-y-4 md:grid-cols-2">
      {sorted.map((topic) => {
        const percentage = Math.round(topic.porcentajeAciertos)
        return (
          <li key={topic.temaId} className="space-y-1.5">
            <div className="flex items-baseline justify-between gap-3">
              <span className="truncate font-medium">{topic.tema}</span>
              <span className="text-sm font-semibold tabular-nums">{percentage}%</span>
            </div>
            <div
              role="img"
              aria-label={`${topic.tema}: ${percentage} % de aciertos`}
              className="h-2 overflow-hidden rounded-full bg-surface-muted"
            >
              <div
                className={`h-full rounded-full ${masteryBar[masteryTone(percentage)]}`}
                style={{ width: `${Math.max(percentage, 2)}%` }}
              />
            </div>
            <p className="text-xs text-ink-muted">
              {topic.correctas} correctas · {topic.incorrectas} incorrectas · {topic.enBlanco} en
              blanco
            </p>
          </li>
        )
      })}
    </ul>
  )
}
