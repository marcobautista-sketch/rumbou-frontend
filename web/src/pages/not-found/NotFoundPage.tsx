import { Link } from 'react-router'
import { paths } from '../../routes/paths'

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="text-6xl font-bold text-indigo-600 dark:text-indigo-400">404</p>
      <h1 className="text-2xl font-semibold">Esta página no existe</h1>
      <p className="text-slate-600 dark:text-slate-300">Revisa la dirección o vuelve al inicio.</p>
      <Link
        to={paths.home}
        className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white transition hover:bg-indigo-500"
      >
        Volver al inicio
      </Link>
    </main>
  )
}
