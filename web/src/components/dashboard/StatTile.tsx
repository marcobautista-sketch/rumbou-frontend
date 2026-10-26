import type { LucideIcon } from 'lucide-react'
import { Card } from '../ui/Card'
import { Skeleton } from '../ui/Skeleton'

type StatTone = 'accent' | 'brand'

const iconTones: Record<StatTone, string> = {
  accent: 'bg-accent-soft text-accent-ink',
  brand: 'bg-chip text-primary',
}

interface StatTileProps {
  icon: LucideIcon
  label: string
  value: string | null
  tone?: StatTone
}

export function StatTile({ icon: Icon, label, value, tone = 'accent' }: StatTileProps) {
  return (
    <Card className="flex items-center gap-4">
      <span className={`rounded-full p-3 ${iconTones[tone]}`}>
        <Icon aria-hidden className="size-6" />
      </span>
      <div>
        {value === null ? (
          <Skeleton className="h-7 w-20" />
        ) : (
          <p className="font-display text-2xl font-bold">{value}</p>
        )}
        <p className="text-sm font-medium tracking-wide text-ink-muted uppercase">{label}</p>
      </div>
    </Card>
  )
}
