import { X } from 'lucide-react'
import { useEffect } from 'react'
import { NavLink } from 'react-router'
import { useAuth } from '../../hooks/useAuth'
import { paths } from '../../routes/paths'
import { navItems } from './navItems'

interface SidebarProps {
  open: boolean
  onClose: () => void
}

function SidebarLinks({ onNavigate }: { onNavigate?: () => void }) {
  const { hasRole } = useAuth()
  const visibleItems = navItems.filter((item) => !item.roles || hasRole(...item.roles))

  return (
    <ul className="space-y-1">
      {visibleItems.map(({ label, to, icon: Icon }) => (
        <li key={to}>
          <NavLink
            to={to}
            end={to === paths.home || to === paths.newExam}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-indigo-500 ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
              }`
            }
          >
            <Icon aria-hidden className="size-5" />
            {label}
          </NavLink>
        </li>
      ))}
    </ul>
  )
}

export function Sidebar({ open, onClose }: SidebarProps) {
  useEffect(() => {
    if (!open) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [open, onClose])

  return (
    <>
      <nav
        aria-label="Menú principal"
        className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 overflow-y-auto border-r border-slate-200 p-4 lg:block dark:border-slate-800"
      >
        <SidebarLinks />
      </nav>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={onClose}
            className="absolute inset-0 animate-fade-in bg-slate-950/50 backdrop-blur-sm"
          />
          <nav
            id="mobile-menu"
            aria-label="Menú principal"
            className="relative flex h-full w-72 max-w-[85%] animate-slide-in flex-col gap-4 bg-white p-4 shadow-xl dark:bg-slate-900"
          >
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">RumboU</span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar menú"
                autoFocus
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-indigo-500 dark:hover:bg-slate-800"
              >
                <X aria-hidden className="size-5" />
              </button>
            </div>
            <SidebarLinks onNavigate={onClose} />
          </nav>
        </div>
      )}
    </>
  )
}
