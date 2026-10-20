import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  message: string
  action?: ReactNode
}

export function EmptyState({ icon: Icon, title, message, action }: EmptyStateProps) {
  return (
    <div className="flex animate-fade-in flex-col items-center gap-3 rounded-2xl border border-dashed border-line px-6 py-12 text-center">
      <span className="rounded-full bg-accent-soft p-4">
        <Icon aria-hidden className="size-8 text-accent-ink" />
      </span>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="max-w-sm text-ink-muted">{message}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
