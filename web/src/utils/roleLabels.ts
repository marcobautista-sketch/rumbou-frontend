import type { Role } from '../types/auth'

export const roles: Role[] = ['USER', 'REVIEWER', 'ADMIN']

export const roleLabels: Record<Role, string> = {
  USER: 'Postulante',
  REVIEWER: 'Revisor',
  ADMIN: 'Administrador',
}
