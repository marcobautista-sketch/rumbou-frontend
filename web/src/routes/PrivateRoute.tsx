import { Navigate, Outlet, useLocation } from 'react-router'
import { PageLoader } from '../components/feedback/PageLoader'
import { useAuth } from '../hooks/useAuth'
import { paths } from './paths'

export function PrivateRoute() {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'loading') return <PageLoader />
  if (status === 'anonymous') {
    return <Navigate to={paths.login} replace state={{ from: location }} />
  }
  return <Outlet />
}
