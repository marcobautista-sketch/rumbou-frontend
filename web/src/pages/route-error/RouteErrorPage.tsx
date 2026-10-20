import { useRouteError } from 'react-router'
import { ErrorScreen } from '../../components/feedback/ErrorScreen'

export default function RouteErrorPage() {
  const error = useRouteError()
  console.error(error)

  return (
    <ErrorScreen
      title="No pudimos mostrar esta página"
      message="Ocurrió un error al cargarla. Puede ser una falla de conexión: intenta de nuevo."
      onRetry={() => window.location.reload()}
    />
  )
}
