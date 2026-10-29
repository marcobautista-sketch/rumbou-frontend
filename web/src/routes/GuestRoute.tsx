import { Navigate, Outlet, useLocation } from 'react-router'
import { PageLoader } from '../components/feedback/PageLoader'
import { useAuth } from '../hooks/useAuth'
import { paths } from './paths'

interface RedirectState {
  from?: { pathname: string; search: string }
}

export function GuestRoute() {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'loading') return <PageLoader />
  if (status === 'authenticated') {
    const from = (location.state as RedirectState | null)?.from
    return <Navigate to={from ? from.pathname + from.search : paths.dashboard} replace />
  }
  return <Outlet />
}
