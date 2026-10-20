import { LogOut, RotateCw } from 'lucide-react'
import { useCallback, useState } from 'react'
import { subscriptionService } from '../../api/subscriptionService'
import { PlanDetails } from '../../components/profile/PlanDetails'
import { Button } from '../../components/ui/Button'
import { useAuth } from '../../hooks/useAuth'
import { useFetch } from '../../hooks/useFetch'
import { notify } from '../../utils/notify'
import { roleLabels } from '../../utils/roleLabels'

const cardStyles =
  'space-y-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900'

function ProfileItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="font-medium break-words">{value}</dd>
    </div>
  )
}

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const [upgrading, setUpgrading] = useState(false)
  const fetchSubscription = useCallback(
    (signal: AbortSignal) => subscriptionService.getCurrent(signal),
    [],
  )
  const subscription = useFetch(fetchSubscription)

  const upgradeToPro = async () => {
    setUpgrading(true)
    try {
      const { linkPago } = await subscriptionService.subscribeToPro()
      if (linkPago) window.location.assign(linkPago)
      else setUpgrading(false)
    } catch (error) {
      notify.error(error)
      setUpgrading(false)
    }
  }

  if (!user) return null

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Mi perfil</h1>
        <Button variant="secondary" onClick={logout}>
          <LogOut aria-hidden className="size-4" />
          Cerrar sesión
        </Button>
      </header>

      <section aria-labelledby="account-title" className={cardStyles}>
        <h2 id="account-title" className="text-lg font-semibold">
          Tu cuenta
        </h2>
        <dl className="grid gap-4 sm:grid-cols-3">
          <ProfileItem label="Nombre" value={user.nombre} />
          <ProfileItem label="Correo" value={user.email} />
          <ProfileItem label="Rol" value={roleLabels[user.role]} />
        </dl>
      </section>

      <section aria-labelledby="plan-title" aria-busy={subscription.loading} className={cardStyles}>
        <h2 id="plan-title" className="text-lg font-semibold">
          Tu plan
        </h2>
        {subscription.loading ? (
          <div className="h-20 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
        ) : subscription.error ? (
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-red-600 dark:text-red-400">{subscription.error.message}</p>
            <Button variant="ghost" onClick={subscription.retry}>
              <RotateCw aria-hidden className="size-4" />
              Reintentar
            </Button>
          </div>
        ) : (
          <PlanDetails
            subscription={subscription.data}
            upgrading={upgrading}
            onUpgrade={upgradeToPro}
          />
        )}
      </section>
    </main>
  )
}
