import { LogOut, Plus, X } from 'lucide-react'
import { useEffect } from 'react'
import { Link, NavLink } from 'react-router'
import { useAuth } from '../../hooks/useAuth'
import { paths } from '../../routes/paths'
import { roleLabels } from '../../utils/roleLabels'
import { BrandMark } from '../brand/BrandMark'
import { Avatar } from '../ui/Avatar'
import { buttonStyles } from '../ui/buttonStyles'
import { ThemeToggle } from '../ui/ThemeToggle'
import { navSections } from './navItems'

const focusRing = 'focus-visible:outline-2 focus-visible:outline-accent'

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { user, hasRole, logout } = useAuth()
  const sections = navSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => !item.roles || hasRole(...item.roles)),
    }))
    .filter((section) => section.items.length > 0)

  return (
    <div className="flex h-full flex-col">
      <div className="space-y-5 px-4 pt-5 pb-4">
        <Link
          to={paths.dashboard}
          onClick={onNavigate}
          aria-label="RumboU, ir al inicio"
          className={`inline-flex rounded-lg px-1 ${focusRing}`}
        >
          <BrandMark />
        </Link>
        <Link
          to={paths.newExam}
          onClick={onNavigate}
          className={`${buttonStyles('primary', 'sm')} w-full shadow-none`}
        >
          <Plus aria-hidden className="size-4" />
          Nuevo simulacro
        </Link>
      </div>

      <nav aria-label="Menú principal" className="flex-1 space-y-5 overflow-y-auto px-3 pb-4">
        {sections.map((section, index) => (
          <div key={section.title ?? index} className="space-y-1">
            {section.title && (
              <p className="px-3 pb-1 text-xs font-semibold tracking-wider text-ink-muted uppercase">
                {section.title}
              </p>
            )}
            <ul className="space-y-0.5">
              {section.items.map(({ label, to, icon: Icon }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={to === paths.dashboard}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${focusRing} ${
                        isActive
                          ? 'bg-chip font-semibold text-primary'
                          : 'font-medium text-ink-muted hover:bg-surface-muted hover:text-ink'
                      }`
                    }
                  >
                    <Icon aria-hidden className="size-[18px]" />
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {user && (
        <div className="flex items-center gap-1 border-t border-line p-3">
          <Link
            to={paths.profile}
            onClick={onNavigate}
            className={`flex min-w-0 flex-1 items-center gap-3 rounded-lg p-2 transition hover:bg-surface-muted ${focusRing}`}
          >
            <Avatar name={user.nombre} size="sm" />
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold">{user.nombre}</span>
              <span className="block truncate text-xs text-ink-muted">{roleLabels[user.role]}</span>
            </span>
          </Link>
          <ThemeToggle />
          <button
            type="button"
            onClick={logout}
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
            className={`rounded-lg p-2 text-ink-muted transition hover:bg-surface-muted hover:text-danger ${focusRing}`}
          >
            <LogOut aria-hidden className="size-5" />
          </button>
        </div>
      )}
    </div>
  )
}

interface SidebarProps {
  open: boolean
  onClose: () => void
}

// En pantallas grandes el menú es una columna fija; en el celular se abre como cajón.
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
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-line bg-surface lg:block">
        <SidebarContent />
      </aside>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={onClose}
            className="absolute inset-0 animate-fade-in bg-black/50 backdrop-blur-sm"
          />
          <div
            id="mobile-menu"
            className="relative h-full w-72 max-w-[85%] animate-slide-in bg-surface shadow-raised"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar menú"
              autoFocus
              className={`absolute top-5 right-3 rounded-lg p-2 text-ink-muted transition hover:bg-surface-muted ${focusRing}`}
            >
              <X aria-hidden className="size-5" />
            </button>
            <SidebarContent onNavigate={onClose} />
          </div>
        </div>
      )}
    </>
  )
}
