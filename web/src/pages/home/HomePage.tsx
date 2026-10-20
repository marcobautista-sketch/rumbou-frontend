import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'
import { BrandLogo } from '../../components/brand/BrandLogo'
import { buttonStyles } from '../../components/ui/buttonStyles'
import { useAuth } from '../../hooks/useAuth'
import { paths } from '../../routes/paths'

export default function HomePage() {
  const { user } = useAuth()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-linear-to-br from-canvas via-surface-muted to-accent-soft px-4 py-10 text-center">
      <div className="space-y-3">
        <h1>
          <BrandLogo size="lg" />
        </h1>
        <p className="text-xl text-ink-muted">Tu camino seguro a la universidad.</p>
      </div>

      <div className="w-full max-w-md space-y-3 rounded-2xl bg-surface/90 p-6 shadow-raised backdrop-blur">
        {user ? (
          <>
            <p className="font-display text-lg font-semibold">Hola, {user.nombre}</p>
            <Link to={paths.newExam} className={`${buttonStyles('primary')} w-full`}>
              Rendir un simulacro
              <ArrowRight aria-hidden className="size-5" />
            </Link>
            <Link to={paths.profile} className={`${buttonStyles('secondary')} w-full`}>
              Ir a mi perfil
            </Link>
          </>
        ) : (
          <>
            <Link to={paths.register} className={`${buttonStyles('primary')} w-full`}>
              Crear cuenta
              <ArrowRight aria-hidden className="size-5" />
            </Link>
            <Link to={paths.login} className={`${buttonStyles('secondary')} w-full`}>
              Ya tengo cuenta - Iniciar sesión
            </Link>
          </>
        )}
      </div>
    </main>
  )
}
