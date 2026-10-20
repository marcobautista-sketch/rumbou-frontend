import {
  ClipboardCheck,
  House,
  LibraryBig,
  NotebookPen,
  UserRound,
  UsersRound,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import { paths } from '../../routes/paths'
import type { Role } from '../../types/auth'

export interface NavItem {
  label: string
  to: string
  icon: LucideIcon
  roles?: Role[]
}

export const navItems: NavItem[] = [
  { label: 'Inicio', to: paths.home, icon: House },
  { label: 'Desafío diario', to: paths.challenge, icon: Zap },
  { label: 'Nuevo simulacro', to: paths.newExam, icon: NotebookPen },
  { label: 'Banco de preguntas', to: paths.questions, icon: LibraryBig },
  { label: 'Revisión', to: paths.review, icon: ClipboardCheck, roles: ['REVIEWER', 'ADMIN'] },
  { label: 'Usuarios', to: paths.adminUsers, icon: UsersRound, roles: ['ADMIN'] },
  { label: 'Mi perfil', to: paths.profile, icon: UserRound },
]
