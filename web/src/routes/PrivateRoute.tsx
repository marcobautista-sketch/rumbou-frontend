import { Navigate, Outlet, useLocation } from 'react-router'
import { AppShellSkeleton } from '../components/feedback/RouteSkeletons'
import { useAuth } from '../hooks/useAuth'
import { paths } from './paths'

export function PrivateRoute() {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'loading') return <AppShellSkeleton />
  if (status === 'anonymous') {
    return <Navigate to={paths.login} replace state={{ from: location }} />
  }
  return <Outlet />
}
