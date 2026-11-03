import { Compass } from 'lucide-react'
import { Link } from 'react-router'
import { BrandMark } from '../../components/brand/BrandMark'
import { buttonStyles } from '../../components/ui/buttonStyles'
import { paths } from '../../routes/paths'

export default function NotFoundPage() {
  return (
    <div className="relative flex min-h-screen flex-col bg-canvas">
      <div aria-hidden className="paper-grid absolute inset-x-0 top-0 h-96" />
      <header className="relative px-4 pt-5 sm:px-8">
        <Link
          to={paths.home}
          aria-label="RumboU, portada"
          className="inline-flex rounded-lg focus-visible:outline-2 focus-visible:outline-accent"
        >
          <BrandMark />
        </Link>
      </header>
      <main className="relative flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
        <span className="rounded-2xl bg-chip p-4 text-primary">
          <Compass aria-hidden className="size-10" />
        </span>
        <p className="font-display text-sm font-bold tracking-widest text-primary">ERROR 404</p>
        <h1 className="text-3xl font-bold tracking-tight">Esta página no existe</h1>
        <p className="max-w-md text-ink-muted">
          Puede que el enlace esté incompleto o que la página haya cambiado de lugar. Retoma tu
          rumbo desde el inicio.
        </p>
        <Link to={paths.home} className={`${buttonStyles('primary')} mt-2`}>
          Volver al inicio
        </Link>
      </main>
    </div>
  )
}
