import { useMemo } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { ScoreHistoryEntry } from '../../types/progress'
import { formatScore, formatShortDate } from '../../utils/format'
import { axisTick, tooltipStyle } from './chartTheme'

interface ScoreHistoryChartProps {
  history: ScoreHistoryEntry[]
  cutoff?: number
  height?: number
}

export function ScoreHistoryChart({ history, cutoff, height = 260 }: ScoreHistoryChartProps) {
  const data = useMemo(
    () =>
      history.map((entry) => ({
        fecha: formatShortDate(entry.fechaFin),
        psp: entry.psp,
      })),
    [history],
  )
  const maxScore = useMemo(
    () => Math.max(cutoff ?? 0, ...history.map((entry) => entry.psp)),
    [history, cutoff],
  )

  return (
    <figure>
      <figcaption className="sr-only">
        Evolución de tu PSP:{' '}
        {data.map((point) => `${point.fecha} ${formatScore(point.psp)}`).join(', ')}
      </figcaption>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 16, right: 16, left: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--line)" />
          <XAxis dataKey="fecha" tick={axisTick} stroke="var(--line)" />
          <YAxis
            domain={[0, Math.ceil(maxScore * 1.1)]}
            tick={axisTick}
            stroke="var(--line)"
            width={48}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value) => [formatScore(Number(value)), 'PSP']}
          />
          {cutoff !== undefined && (
            <ReferenceLine
              y={cutoff}
              stroke="var(--warning)"
              strokeDasharray="6 4"
              label={{
                value: 'Último ingresante',
                position: 'insideTopRight',
                fill: 'var(--warning)',
                fontSize: 12,
              }}
            />
          )}
          <Line
            type="monotone"
            dataKey="psp"
            stroke="var(--accent)"
            strokeWidth={3}
            dot={{ r: 4, fill: 'var(--accent)' }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </figure>
  )
}
