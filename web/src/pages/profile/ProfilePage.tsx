import { LogOut, Pencil, RotateCw } from 'lucide-react'
import { useCallback, useState } from 'react'
import { subscriptionService } from '../../api/subscriptionService'
import { Page } from '../../components/layout/Page'
import { PageHeader } from '../../components/layout/PageHeader'
import { ChangePasswordForm } from '../../components/profile/ChangePasswordForm'
import { EditProfileForm } from '../../components/profile/EditProfileForm'
import { PlanDetails } from '../../components/profile/PlanDetails'
import { Avatar } from '../../components/ui/Avatar'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { useAuth } from '../../hooks/useAuth'
import { useFetch } from '../../hooks/useFetch'
import { notify } from '../../utils/notify'
import { roleLabels } from '../../utils/roleLabels'

function ProfileItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm text-ink-muted">{label}</dt>
      <dd className="font-medium break-words">{value}</dd>
    </div>
  )
}

export default function ProfilePage() {
  const { user, logout, updateUser } = useAuth()
  const [upgrading, setUpgrading] = useState(false)
  const [editing, setEditing] = useState(false)
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
    <Page>
      <PageHeader
        title="Mi perfil"
        description="Tus datos, tu contraseña y tu plan."
        actions={
          <Button variant="secondary" onClick={logout}>
            <LogOut aria-hidden className="size-4" />
            Cerrar sesión
          </Button>
        }
      />

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-6">
          <Card aria-labelledby="account-title" className="space-y-5">
            <div className="flex items-center gap-4">
              <Avatar name={user.nombre} size="lg" />
              <div className="min-w-0">
                <p className="truncate text-xl font-bold">
                  {[user.nombre, user.apellidos].filter(Boolean).join(' ')}
                </p>
                <p className="truncate text-ink-muted">{user.email}</p>
                <p className="text-sm font-semibold text-primary">{roleLabels[user.role]}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
              <h2 id="account-title" className="text-lg font-bold">
                Tus datos
              </h2>
              {!editing && (
                <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
                  <Pencil aria-hidden className="size-4" />
                  Editar datos
                </Button>
              )}
            </div>
            {editing ? (
              <EditProfileForm
                user={user}
                onCancel={() => setEditing(false)}
                onSaved={(updated) => {
                  updateUser(updated)
                  setEditing(false)
                }}
              />
            ) : (
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <ProfileItem label="Nombres" value={user.nombre} />
                <ProfileItem label="Apellidos" value={user.apellidos ?? 'Sin registrar'} />
                <ProfileItem label="Correo" value={user.email} />
                <ProfileItem label="Celular" value={user.telefono ?? 'Sin registrar'} />
              </dl>
            )}
          </Card>

          <Card aria-labelledby="password-title" className="space-y-4">
            <h2 id="password-title" className="text-lg font-bold">
              Contraseña
            </h2>
            <ChangePasswordForm />
          </Card>
        </div>

        <Card
          aria-labelledby="plan-title"
          aria-busy={subscription.loading}
          className="space-y-4 lg:sticky lg:top-6"
        >
          <h2 id="plan-title" className="text-lg font-bold">
            Tu plan
          </h2>
          {subscription.loading ? (
            <div className="h-20 animate-pulse rounded-lg bg-surface-muted" />
          ) : subscription.error ? (
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-danger">{subscription.error.message}</p>
              <Button variant="ghost" onClick={subscription.retry}>
                <RotateCw aria-hidden className="size-4" />
                Reintentar
              </Button>
            </div>
          ) : (
            <PlanDetails
              subscription={subscription.data}
              isAdmin={user.role === 'ADMIN'}
              upgrading={upgrading}
              onUpgrade={upgradeToPro}
            />
          )}
        </Card>
      </div>
    </Page>
  )
}
