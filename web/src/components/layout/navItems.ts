import {
  ChartLine,
  ClipboardCheck,
  GraduationCap,
  House,
  LibraryBig,
  Medal,
  NotebookPen,
  Trophy,
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

export interface NavSection {
  title?: string
  items: NavItem[]
}

// El menú sigue el recorrido del postulante: practicar y luego ver hacia dónde va.
// "Simulacros" queda activo también en el simulacro en curso y en su resultado (/exams/...).
export const navSections: NavSection[] = [
  { items: [{ label: 'Inicio', to: paths.dashboard, icon: House }] },
  {
    title: 'Practicar',
    items: [
      { label: 'Simulacros', to: paths.examHistory, icon: NotebookPen },
      { label: 'Desafío diario', to: paths.challenge, icon: Zap },
      { label: 'Banco de preguntas', to: paths.questions, icon: LibraryBig },
    ],
  },
  {
    title: 'Mi rumbo',
    items: [
      { label: 'Progreso', to: paths.progress, icon: ChartLine },
      { label: 'Carreras', to: paths.careers, icon: GraduationCap },
      { label: 'Logros', to: paths.achievements, icon: Trophy },
      { label: 'Liga semanal', to: paths.league, icon: Medal },
    ],
  },
  {
    title: 'Gestión',
    items: [
      { label: 'Revisión', to: paths.review, icon: ClipboardCheck, roles: ['REVIEWER', 'ADMIN'] },
      { label: 'Usuarios', to: paths.adminUsers, icon: UsersRound, roles: ['ADMIN'] },
    ],
  },
]
