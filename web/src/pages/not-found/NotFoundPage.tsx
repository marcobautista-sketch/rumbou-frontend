import { Link } from 'react-router'
import { buttonStyles } from '../../components/ui/buttonStyles'
import { paths } from '../../routes/paths'

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="font-display text-6xl font-bold text-primary">404</p>
      <h1 className="text-2xl font-bold">Esta página no existe</h1>
      <p className="text-ink-muted">Revisa la dirección o vuelve al inicio.</p>
      <Link to={paths.home} className={buttonStyles('primary')}>
        Volver al inicio
      </Link>
    </main>
  )
}
