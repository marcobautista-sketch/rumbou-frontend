import { Outlet } from 'react-router'
import { ErrorScreen } from '../components/feedback/ErrorScreen'
import { useAuth } from '../hooks/useAuth'
import type { Role } from '../types/auth'

interface RoleRouteProps {
  roles: Role[]
}

export function RoleRoute({ roles }: RoleRouteProps) {
  const { hasRole } = useAuth()

  if (!hasRole(...roles)) {
    return (
      <ErrorScreen
        title="No tienes acceso a esta sección"
        message="Esta parte de RumboU es solo para revisores o administradores."
      />
    )
  }
  return <Outlet />
}
