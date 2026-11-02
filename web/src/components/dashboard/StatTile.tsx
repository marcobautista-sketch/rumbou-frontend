import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Card } from '../ui/Card'
import { Skeleton } from '../ui/Skeleton'

type StatTone = 'accent' | 'brand' | 'warning'

const iconTones: Record<StatTone, string> = {
  accent: 'bg-accent-soft text-accent-ink',
  brand: 'bg-chip text-primary',
  warning: 'bg-warning-soft text-warning',
}

interface StatTileProps {
  icon: LucideIcon
  label: string
  value: string | null
  hint?: ReactNode
  tone?: StatTone
}

export function StatTile({ icon: Icon, label, value, hint, tone = 'accent' }: StatTileProps) {
  return (
    <Card className="flex items-start gap-4 p-5">
      <span className={`rounded-xl p-2.5 ${iconTones[tone]}`}>
        <Icon aria-hidden className="size-5" />
      </span>
      <div className="min-w-0 space-y-0.5">
        <p className="text-sm text-ink-muted">{label}</p>
        {value === null ? (
          <Skeleton className="h-7 w-20" />
        ) : (
          <p className="font-display text-2xl font-bold tracking-tight tabular-nums">{value}</p>
        )}
        {hint && <div className="text-sm text-ink-muted">{hint}</div>}
      </div>
    </Card>
  )
}
