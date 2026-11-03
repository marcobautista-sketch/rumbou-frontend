import { Check, Crown, ShieldCheck } from 'lucide-react'
import type { Subscription } from '../../types/subscription'
import { formatDate } from '../../utils/format'
import { PRO_PRICE, proPlanBenefits } from '../../utils/plans'
import { Button } from '../ui/Button'

function BenefitList({ benefits }: { benefits: string[] }) {
  return (
    <ul className="space-y-2">
      {benefits.map((benefit) => (
        <li key={benefit} className="flex items-start gap-2 text-sm">
          <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-success" />
          {benefit}
        </li>
      ))}
    </ul>
  )
}

interface PlanDetailsProps {
  subscription: Subscription | null
  isAdmin: boolean
  upgrading: boolean
  onUpgrade: () => void
}

export function PlanDetails({ subscription, isAdmin, upgrading, onUpgrade }: PlanDetailsProps) {
  if (isAdmin) {
    return (
      <p className="flex items-start gap-2 text-sm">
        <ShieldCheck aria-hidden className="size-5 shrink-0 text-success" />
        Tu cuenta de administrador tiene acceso completo, sin límites de plan.
      </p>
    )
  }

  if (subscription?.estado === 'ACTIVA') {
    return (
      <div className="space-y-4">
        <div className="rounded-xl bg-chip p-4">
          <p className="flex items-center gap-2 font-bold text-primary">
            <Crown aria-hidden className="size-5 text-warning" />
            Plan PRO
          </p>
          {subscription.fechaFin && (
            <p className="mt-1 text-sm text-ink-muted">
              Activo hasta el {formatDate(subscription.fechaFin)}
            </p>
          )}
        </div>
        <BenefitList benefits={proPlanBenefits} />
      </div>
    )
  }

  if (subscription?.estado === 'PENDIENTE') {
    return (
      <div className="space-y-3">
        <p className="text-sm text-ink-muted">
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
    <div className="space-y-4">
      <div className="rounded-xl bg-surface-muted p-4">
        <p className="font-bold">Plan Gratuito</p>
        <p className="mt-1 text-sm text-ink-muted">
          3 simulacros por tema a la semana y 1 completo al mes.
        </p>
      </div>
      <p className="text-sm font-semibold">Con PRO tienes:</p>
      <BenefitList benefits={proPlanBenefits} />
      <Button onClick={onUpgrade} loading={upgrading} className="w-full">
        <Crown aria-hidden className="size-4" />
        Pasar a PRO por {PRO_PRICE} al mes
      </Button>
    </div>
  )
}
