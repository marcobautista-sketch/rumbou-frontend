import { WifiOff } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useOnlineStatus } from '../../hooks/useOnlineStatus'
import { notify } from '../../utils/notify'

// Aviso fijo arriba mientras no hay internet, como en la app. Al volver la conexión se avisa una
// vez con un toast, para que la persona sepa que ya puede reintentar.
export function OfflineBanner() {
  const online = useOnlineStatus()
  const wasOffline = useRef(false)

  useEffect(() => {
    if (!online) {
      wasOffline.current = true
      return
    }
    if (wasOffline.current) {
      wasOffline.current = false
      notify.success('Conexión restablecida.')
    }
  }, [online])

  if (online) return null

  return (
    <div
      role="alert"
      aria-live="polite"
      className="sticky top-0 z-50 flex items-center justify-center gap-2 bg-danger-soft px-4 py-2 text-center text-sm font-semibold text-danger"
    >
      <WifiOff aria-hidden className="size-4 shrink-0" />
      Sin conexión a internet. Revisa tu Wi-Fi o tus datos móviles.
    </div>
  )
}
