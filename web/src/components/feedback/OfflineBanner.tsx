import { CloudOff, Wifi } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useOnlineStatus } from '../../hooks/useOnlineStatus'

const RECOVERED_NOTICE_MS = 3000

// Equivalente web del OfflineBanner del móvil. Solo avisa si se perdió la conexión, y al volver lo
// confirma unos segundos. Flota sobre la página, sin mover el contenido ni bloquear los botones.
export function OfflineBanner() {
  const online = useOnlineStatus()
  const [recovered, setRecovered] = useState(false)

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    const showRecovered = () => {
      setRecovered(true)
      timer = setTimeout(() => setRecovered(false), RECOVERED_NOTICE_MS)
    }
    const hideRecovered = () => {
      clearTimeout(timer)
      setRecovered(false)
    }
    window.addEventListener('online', showRecovered)
    window.addEventListener('offline', hideRecovered)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('online', showRecovered)
      window.removeEventListener('offline', hideRecovered)
    }
  }, [])

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4"
    >
      {!online && (
        <p className="flex items-center gap-2 rounded-xl bg-danger-soft px-4 py-3 text-sm font-semibold text-danger shadow-raised">
          <CloudOff aria-hidden className="size-5 shrink-0" />
          Sin conexión a internet. Revisa tu Wi-Fi o tus datos móviles.
        </p>
      )}
      {online && recovered && (
        <p className="flex items-center gap-2 rounded-xl bg-success-soft px-4 py-3 text-sm font-semibold text-success shadow-raised">
          <Wifi aria-hidden className="size-5 shrink-0" />
          Conexión restablecida.
        </p>
      )}
    </div>
  )
}
