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
        <span className="rounded-full bg-danger-soft p-4">
          <ShieldOff aria-hidden className="size-10 text-danger" />
        </span>
        <p className="text-sm font-semibold tracking-widest text-danger">ERROR 403</p>
        <h1 className="text-2xl font-semibold">No tienes acceso a esta sección</h1>
        <p className="text-ink-muted">
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
