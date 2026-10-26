import type { CSSProperties } from 'react'
import type { MasteryTone } from '../../utils/progressLabels'

export const axisTick = { fill: 'var(--ink-muted)', fontSize: 12 }

export const tooltipStyle: CSSProperties = {
  backgroundColor: 'var(--surface)',
  border: '1px solid var(--line)',
  borderRadius: '0.75rem',
  color: 'var(--ink)',
}

export const masteryColors: Record<MasteryTone, string> = {
  success: 'var(--success)',
  warning: 'var(--warning)',
  danger: 'var(--danger)',
}
