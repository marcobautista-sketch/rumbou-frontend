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
    <div className="flex animate-fade-in flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 px-6 py-12 text-center dark:border-slate-700">
      <span className="rounded-full bg-indigo-50 p-4 dark:bg-indigo-950">
        <Icon aria-hidden className="size-8 text-indigo-600 dark:text-indigo-400" />
      </span>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="max-w-sm text-slate-600 dark:text-slate-400">{message}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
