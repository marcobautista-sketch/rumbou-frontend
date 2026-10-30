import type { Role } from '../types/auth'

export const roleLabels: Record<Role, string> = {
  USER: 'Postulante',
  REVIEWER: 'Revisor',
  ADMIN: 'Administrador',
}
