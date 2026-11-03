import { House, RotateCw, TriangleAlert } from 'lucide-react'
import { buttonStyles } from '../ui/buttonStyles'

interface ErrorScreenProps {
  title: string
  message: string
  onRetry?: () => void
}

export function ErrorScreen({ title, message, onRetry }: ErrorScreenProps) {
  return (
    <main
      role="alert"
      className="flex min-h-[80vh] flex-col items-center justify-center gap-4 p-6 text-center"
    >
      <span className="rounded-2xl bg-warning-soft p-4 text-warning">
        <TriangleAlert aria-hidden className="size-9" />
      </span>
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      <p className="max-w-md text-ink-muted">{message}</p>
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        {onRetry && (
          <button type="button" onClick={onRetry} className={buttonStyles('primary')}>
            <RotateCw aria-hidden className="size-4" />
            Reintentar
          </button>
        )}
        <a href="/" className={buttonStyles('secondary')}>
          <House aria-hidden className="size-4" />
          Ir al inicio
        </a>
      </div>
    </main>
  )
}
