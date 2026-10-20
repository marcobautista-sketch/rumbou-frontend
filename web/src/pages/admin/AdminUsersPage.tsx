import { Search, UserRoundSearch, UserRoundX } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useSearchParams } from 'react-router'
import { z } from 'zod'
import { userService } from '../../api/userService'
import { UserRoleCard } from '../../components/admin/UserRoleCard'
import { InlineError } from '../../components/feedback/InlineError'
import { PageHeader } from '../../components/layout/PageHeader'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { EmptyState } from '../../components/ui/EmptyState'
import { Skeleton } from '../../components/ui/Skeleton'
import { TextField } from '../../components/ui/TextField'
import { useAuth } from '../../hooks/useAuth'
import { useDebounce } from '../../hooks/useDebounce'
import { useFetch } from '../../hooks/useFetch'
import type { Role, User } from '../../types/auth'
import { notify } from '../../utils/notify'
import { roleLabels } from '../../utils/roleLabels'

const emailSchema = z.email()

interface PendingChange {
  user: User
  role: Role
}

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [email, setEmail] = useState(searchParams.get('email') ?? '')
  const [pendingChange, setPendingChange] = useState<PendingChange | null>(null)
  const [saving, setSaving] = useState(false)

  const debouncedEmail = useDebounce(email.trim().toLowerCase(), 500)
  const isValidEmail = emailSchema.safeParse(debouncedEmail).success

  const fetchUser = useCallback(
    (signal: AbortSignal): Promise<User | null> =>
      isValidEmail ? userService.findByEmail(debouncedEmail, signal) : Promise.resolve(null),
    [debouncedEmail, isValidEmail],
  )
  const found = useFetch(fetchUser)

  const updateEmail = (value: string) => {
    setEmail(value)
    setSearchParams(value ? { email: value } : {}, { replace: true })
  }

  const changeRole = async () => {
    if (!pendingChange) return
    setSaving(true)
    try {
      await userService.changeRole(pendingChange.user.id, pendingChange.role)
      notify.success(`${pendingChange.user.nombre} ahora es ${roleLabels[pendingChange.role]}`)
      found.retry()
    } catch (error) {
      notify.error(error)
    } finally {
      setSaving(false)
      setPendingChange(null)
    }
  }

  const typedButInvalid = email.trim() !== '' && !emailSchema.safeParse(email.trim()).success

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6">
      <PageHeader
        title="Usuarios"
        description="Busca una cuenta por su correo para darle permisos de revisor o administrador."
        breadcrumbs={[{ label: 'Administración' }, { label: 'Usuarios' }]}
      />

      <div className="relative">
        <TextField
          label="Correo del usuario"
          type="email"
          inputMode="email"
          autoComplete="off"
          placeholder="postulante@correo.com"
          value={email}
          onChange={(event) => updateEmail(event.target.value)}
          hint={
            typedButInvalid
              ? 'Sigue escribiendo: buscaremos cuando el correo esté completo.'
              : 'La búsqueda empieza sola mientras escribes.'
          }
          className="[&_input]:pl-10"
        />
        <Search
          aria-hidden
          className="pointer-events-none absolute top-[2.15rem] left-3 size-5 text-slate-400"
        />
      </div>

      <section aria-live="polite" aria-busy={found.loading}>
        {!isValidEmail ? (
          <EmptyState
            icon={UserRoundSearch}
            title="Busca una cuenta"
            message="Escribe el correo completo con el que se registró el usuario."
          />
        ) : found.loading ? (
          <div
            role="status"
            aria-label="Buscando usuario…"
            className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center gap-4">
              <Skeleton className="size-16 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-56" />
              </div>
            </div>
          </div>
        ) : found.error?.kind === 'notFound' ? (
          <EmptyState
            icon={UserRoundX}
            title="No encontramos esa cuenta"
            message={`No hay ningún usuario registrado con ${debouncedEmail}. Revisa que esté bien escrito.`}
          />
        ) : found.error ? (
          <InlineError message={found.error.message} onRetry={found.retry} />
        ) : (
          found.data && (
            <UserRoleCard
              key={`${found.data.id}-${found.data.role}`}
              user={found.data}
              isCurrentUser={found.data.id === currentUser?.id}
              onRequestChange={(role) => found.data && setPendingChange({ user: found.data, role })}
            />
          )
        )}
      </section>

      <ConfirmDialog
        open={pendingChange !== null}
        title="¿Cambiar el rol?"
        message={
          pendingChange
            ? `${pendingChange.user.nombre} pasará de ${roleLabels[pendingChange.user.role]} a ${roleLabels[pendingChange.role]}. Sus permisos cambiarán la próxima vez que use la aplicación.`
            : ''
        }
        confirmLabel="Sí, cambiar rol"
        loading={saving}
        onConfirm={changeRole}
        onCancel={() => setPendingChange(null)}
      />
    </main>
  )
}
