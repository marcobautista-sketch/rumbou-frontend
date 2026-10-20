import type { ReactNode } from 'react'

export type BadgeTone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger'

const tones: Record<BadgeTone, string> = {
  neutral: 'bg-surface-muted text-ink-muted ring-line',
  brand: 'bg-chip text-primary ring-transparent',
  success: 'bg-success/10 text-success ring-success/30',
  warning: 'bg-warning/10 text-warning ring-warning/30',
  danger: 'bg-danger-soft text-danger ring-danger/30',
}

interface BadgeProps {
  tone?: BadgeTone
  children: ReactNode
}

export function Badge({ tone = 'neutral', children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ring-1 ring-inset ${tones[tone]}`}
    >
      {children}
    </span>
  )
}
