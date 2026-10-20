import { ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import type { Role, User } from '../../types/auth'
import { roleLabels, roles } from '../../utils/roleLabels'
import { Avatar } from '../ui/Avatar'
import { Badge, type BadgeTone } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { SelectField } from '../ui/SelectField'

const roleTones: Record<Role, BadgeTone> = {
  USER: 'neutral',
  REVIEWER: 'amber',
  ADMIN: 'indigo',
}

const roleDescriptions: Record<Role, string> = {
  USER: 'Rinde simulacros y ve solo preguntas aprobadas.',
  REVIEWER: 'Además, revisa y aprueba preguntas generadas con IA.',
  ADMIN: 'Acceso total: crea, edita y elimina preguntas y gestiona roles.',
}

interface UserRoleCardProps {
  user: User
  isCurrentUser: boolean
  onRequestChange: (role: Role) => void
}

export function UserRoleCard({ user, isCurrentUser, onRequestChange }: UserRoleCardProps) {
  const [selectedRole, setSelectedRole] = useState<Role>(user.role)

  return (
    <Card className="animate-fade-in space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <Avatar name={user.nombre} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-semibold">{user.nombre}</p>
          <p className="truncate text-slate-600 dark:text-slate-400">{user.email}</p>
        </div>
        <Badge tone={roleTones[user.role]}>
          <ShieldCheck aria-hidden className="size-3" />
          {roleLabels[user.role]}
        </Badge>
      </div>

      <form
        className="flex flex-col gap-4 border-t border-slate-200 pt-6 sm:flex-row sm:items-end dark:border-slate-800"
        onSubmit={(event) => {
          event.preventDefault()
          onRequestChange(selectedRole)
        }}
      >
        <div className="flex-1 space-y-1">
          <SelectField
            label="Nuevo rol"
            value={selectedRole}
            disabled={isCurrentUser}
            onChange={(event) => setSelectedRole(event.target.value as Role)}
          >
            {roles.map((role) => (
              <option key={role} value={role}>
                {roleLabels[role]}
              </option>
            ))}
          </SelectField>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {isCurrentUser
              ? 'No puedes cambiar tu propio rol: el sistema podría quedarse sin administradores.'
              : roleDescriptions[selectedRole]}
          </p>
        </div>
        <Button type="submit" disabled={isCurrentUser || selectedRole === user.role}>
          Cambiar rol
        </Button>
      </form>
    </Card>
  )
}
