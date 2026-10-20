import { Link } from 'react-router'
import { buttonStyles } from '../../components/ui/buttonStyles'
import { paths } from '../../routes/paths'

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-6 text-center">
      <h1 className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">RumboU</h1>
      <p className="max-w-md text-slate-600 dark:text-slate-300">
        Prepárate para el examen de admisión de la UNI y San Marcos con simulacros reales.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link to={paths.register} className={buttonStyles('primary')}>
          Crear cuenta gratis
        </Link>
        <Link to={paths.login} className={buttonStyles('secondary')}>
          Iniciar sesión
        </Link>
      </div>
    </main>
  )
}
