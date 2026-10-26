import {
  ChartLine,
  ClipboardCheck,
  House,
  LibraryBig,
  NotebookPen,
  Trophy,
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
  { label: 'Inicio', to: paths.dashboard, icon: House },
  { label: 'Mi progreso', to: paths.progress, icon: ChartLine },
  { label: 'Mis logros', to: paths.achievements, icon: Trophy },
  { label: 'Desafío diario', to: paths.challenge, icon: Zap },
  { label: 'Nuevo simulacro', to: paths.newExam, icon: NotebookPen },
  { label: 'Banco de preguntas', to: paths.questions, icon: LibraryBig },
  { label: 'Revisión', to: paths.review, icon: ClipboardCheck, roles: ['REVIEWER', 'ADMIN'] },
  { label: 'Usuarios', to: paths.adminUsers, icon: UsersRound, roles: ['ADMIN'] },
  { label: 'Mi perfil', to: paths.profile, icon: UserRound },
]
