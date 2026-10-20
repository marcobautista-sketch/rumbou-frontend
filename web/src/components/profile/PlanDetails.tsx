import { Crown } from 'lucide-react'
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
  upgrading: boolean
  onUpgrade: () => void
}

export function PlanDetails({ subscription, upgrading, onUpgrade }: PlanDetailsProps) {
  if (subscription?.estado === 'ACTIVA') {
    return (
      <p className="flex items-center gap-2">
        <Crown aria-hidden className="size-5 text-amber-500" />
        Tienes el plan PRO
        {subscription.fechaFin ? ` hasta el ${formatDate(subscription.fechaFin)}.` : '.'}
      </p>
    )
  }

  if (subscription?.estado === 'PENDIENTE') {
    return (
      <p className="text-slate-600 dark:text-slate-300">
        Tu pago está en revisión. Apenas Mercado Pago lo confirme, se activa tu plan PRO.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      <p>
        Estás en el plan <strong>Gratuito</strong>. Con PRO tienes:
      </p>
      <ul className="list-inside list-disc space-y-1 text-slate-600 dark:text-slate-300">
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
