import { House, RotateCw, TriangleAlert } from 'lucide-react'

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
      <TriangleAlert aria-hidden className="size-12 text-amber-500" />
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="max-w-md text-slate-600 dark:text-slate-300">{message}</p>
      <div className="flex flex-wrap justify-center gap-3">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white transition hover:bg-indigo-500"
          >
            <RotateCw aria-hidden className="size-4" />
            Reintentar
          </button>
        )}
        <a
          href="/"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 font-medium transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          <House aria-hidden className="size-4" />
          Ir al inicio
        </a>
      </div>
    </main>
  )
}
