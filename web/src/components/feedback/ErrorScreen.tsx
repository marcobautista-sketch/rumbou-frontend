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
      className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center"
    >
      <TriangleAlert aria-hidden className="size-12 text-warning" />
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="max-w-md text-ink-muted">{message}</p>
      <div className="flex flex-wrap justify-center gap-3">
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
