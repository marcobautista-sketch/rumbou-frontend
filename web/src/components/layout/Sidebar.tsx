import { X } from 'lucide-react'
import { useEffect } from 'react'
import { NavLink } from 'react-router'
import { useAuth } from '../../hooks/useAuth'
import { BrandMark } from '../brand/BrandMark'
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
            end={to === paths.home || to === paths.newExam || to === paths.examHistory}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-accent ${
                isActive
                  ? 'bg-accent-soft text-accent-ink'
                  : 'text-ink-muted hover:bg-surface-muted hover:text-ink'
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
        className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 overflow-y-auto border-r border-line p-4 lg:block"
      >
        <SidebarLinks />
      </nav>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={onClose}
            className="absolute inset-0 animate-fade-in bg-black/50 backdrop-blur-sm"
          />
          <nav
            id="mobile-menu"
            aria-label="Menú principal"
            className="relative flex h-full w-72 max-w-[85%] animate-slide-in flex-col gap-4 bg-surface p-4 shadow-raised"
          >
            <div className="flex items-center justify-between">
              <BrandMark />
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar menú"
                autoFocus
                className="rounded-lg p-2 text-ink-muted transition hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-accent"
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
