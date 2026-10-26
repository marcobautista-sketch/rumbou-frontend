import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { TopicMastery } from '../../types/progress'
import { masteryTone } from '../../utils/progressLabels'
import { axisTick, masteryColors, tooltipStyle } from './chartTheme'

interface TopicMasteryChartProps {
  topics: TopicMastery[]
}

export function TopicMasteryChart({ topics }: TopicMasteryChartProps) {
  const data = useMemo(
    () =>
      [...topics]
        .sort((a, b) => b.porcentajeAciertos - a.porcentajeAciertos)
        .map((topic) => ({
          tema: topic.tema,
          porcentaje: topic.porcentajeAciertos,
          color: masteryColors[masteryTone(topic.porcentajeAciertos)],
        })),
    [topics],
  )

  return (
    <figure>
      <figcaption className="sr-only">
        Porcentaje de aciertos por tema:{' '}
        {data.map((topic) => `${topic.tema} ${topic.porcentaje}%`).join(', ')}
      </figcaption>
      <ResponsiveContainer width="100%" height={data.length * 44 + 40}>
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24 }}>
          <CartesianGrid horizontal={false} stroke="var(--line)" />
          <XAxis type="number" domain={[0, 100]} unit="%" tick={axisTick} stroke="var(--line)" />
          <YAxis type="category" dataKey="tema" width={140} tick={axisTick} stroke="var(--line)" />
          <Tooltip
            cursor={{ fill: 'var(--surface-muted)' }}
            contentStyle={tooltipStyle}
            formatter={(value) => [`${value}%`, 'Aciertos']}
          />
          <Bar dataKey="porcentaje" barSize={20} radius={[0, 6, 6, 0]}>
            {data.map((topic) => (
              <Cell key={topic.tema} fill={topic.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </figure>
  )
}
