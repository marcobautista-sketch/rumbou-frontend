import { LoaderCircle } from 'lucide-react'

export function PageLoader() {
  return (
    <div role="status" className="flex min-h-screen items-center justify-center">
      <LoaderCircle aria-hidden className="size-10 animate-spin text-indigo-600" />
      <span className="sr-only">Cargando…</span>
    </div>
  )
}
