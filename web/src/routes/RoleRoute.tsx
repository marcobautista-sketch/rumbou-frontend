import { ShieldOff } from 'lucide-react'
import { Link, Outlet } from 'react-router'
import { buttonStyles } from '../components/ui/buttonStyles'
import { useAuth } from '../hooks/useAuth'
import type { Role } from '../types/auth'
import { roleLabels } from '../utils/roleLabels'
import { paths } from './paths'

interface RoleRouteProps {
  roles: Role[]
}

export function RoleRoute({ roles }: RoleRouteProps) {
  const { hasRole } = useAuth()

  if (!hasRole(...roles)) {
    const allowed = roles.map((role) => roleLabels[role].toLowerCase()).join(' o ')
    return (
      <main
        role="alert"
        className="mx-auto flex max-w-md animate-fade-in flex-col items-center gap-4 px-4 py-20 text-center"
      >
        <span className="rounded-full bg-red-50 p-4 dark:bg-red-950/60">
          <ShieldOff aria-hidden className="size-10 text-red-600 dark:text-red-400" />
        </span>
        <p className="text-sm font-semibold tracking-widest text-red-600 dark:text-red-400">
          ERROR 403
        </p>
        <h1 className="text-2xl font-semibold">No tienes acceso a esta sección</h1>
        <p className="text-slate-600 dark:text-slate-300">
          Esta parte de RumboU es solo para cuentas de tipo {allowed}. Si crees que es un error,
          pídele a un administrador que revise tu rol.
        </p>
        <Link to={paths.home} className={buttonStyles('primary')}>
          Volver al inicio
        </Link>
      </main>
    )
  }
  return <Outlet />
}
