import { Crown, ShieldCheck } from 'lucide-react'
import type { Subscription } from '../../types/subscription'
import { formatDate } from '../../utils/format'
import { Button } from '../ui/Button'

const proBenefits = [
  'Simulacros ilimitados de la UNI y San Marcos',
  'Tutor de IA que explica en qué te equivocaste',
  'Hasta 3 carreras objetivo para comparar',
]

interface PlanDetailsProps {
  subscription: Subscription | null
  isAdmin: boolean
  upgrading: boolean
  onUpgrade: () => void
}

export function PlanDetails({ subscription, isAdmin, upgrading, onUpgrade }: PlanDetailsProps) {
  if (isAdmin) {
    return (
      <p className="flex items-center gap-2">
        <ShieldCheck aria-hidden className="size-5 text-success" />
        Tu cuenta de administrador tiene acceso completo, sin límites de plan.
      </p>
    )
  }

  if (subscription?.estado === 'ACTIVA') {
    return (
      <p className="flex items-center gap-2">
        <Crown aria-hidden className="size-5 text-warning" />
        Tienes el plan PRO
        {subscription.fechaFin ? ` hasta el ${formatDate(subscription.fechaFin)}.` : '.'}
      </p>
    )
  }

  if (subscription?.estado === 'PENDIENTE') {
    return (
      <div className="space-y-3">
        <p className="text-ink-muted">
          Tu pago está en revisión. Si no lo completaste en Mercado Pago, puedes intentarlo de
          nuevo.
        </p>
        <Button variant="secondary" onClick={onUpgrade} loading={upgrading}>
          Volver a intentar el pago
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p>
        Estás en el plan <strong>Gratuito</strong>. Con PRO tienes:
      </p>
      <ul className="list-inside list-disc space-y-1 text-ink-muted">
        {proBenefits.map((benefit) => (
          <li key={benefit}>{benefit}</li>
        ))}
      </ul>
      <Button onClick={onUpgrade} loading={upgrading}>
        <Crown aria-hidden className="size-4" />
        Pasar a PRO por S/ 39 al mes
      </Button>
    </div>
  )
}
