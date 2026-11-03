import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { paths } from './paths'

interface RedirectState {
  from?: { pathname: string; search: string }
}

export function GuestRoute() {
  const { status } = useAuth()
  const location = useLocation()

  // Mientras se comprueba la sesión ya se muestra el formulario: el visitante no espera a la API
  // y, si resulta que tenía sesión, se le redirige en cuanto se confirma.
  if (status === 'authenticated') {
    const from = (location.state as RedirectState | null)?.from
    return <Navigate to={from ? from.pathname + from.search : paths.dashboard} replace />
  }
  return <Outlet />
}
