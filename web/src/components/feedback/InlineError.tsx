import { CircleAlert, RotateCw } from 'lucide-react'
import { Button } from '../ui/Button'

interface InlineErrorProps {
  message: string
  onRetry?: () => void
}

export function InlineError({ message, onRetry }: InlineErrorProps) {
  return (
    <div
      role="alert"
      className="flex animate-fade-in flex-wrap items-center gap-3 rounded-2xl border border-danger/30 bg-danger-soft p-4 text-danger"
    >
      <CircleAlert aria-hidden className="size-5 shrink-0" />
      <p className="flex-1">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          <RotateCw aria-hidden className="size-4" />
          Reintentar
        </Button>
      )}
    </div>
  )
}
