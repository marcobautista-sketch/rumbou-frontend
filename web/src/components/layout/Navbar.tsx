import { LogOut, Menu } from 'lucide-react'
import { Link } from 'react-router'
import { useAuth } from '../../hooks/useAuth'
import { paths } from '../../routes/paths'
import { BrandMark } from '../brand/BrandMark'
import { Avatar } from '../ui/Avatar'
import { ThemeToggle } from '../ui/ThemeToggle'

interface NavbarProps {
  menuOpen: boolean
  onOpenMenu: () => void
}

export function Navbar({ menuOpen, onOpenMenu }: NavbarProps) {
  const { user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-line bg-surface/90 backdrop-blur">
      <div className="flex h-full items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenMenu}
            aria-label="Abrir menú"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="rounded-lg p-2 text-ink-muted transition hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-accent lg:hidden"
          >
            <Menu aria-hidden className="size-5" />
          </button>
          <Link
            to={paths.dashboard}
            aria-label="RumboU, ir al inicio"
            className="rounded-lg transition hover:opacity-80 focus-visible:outline-2 focus-visible:outline-accent"
          >
            <BrandMark />
          </Link>
        </div>

        <div className="flex items-center gap-1 sm:gap-3">
          <ThemeToggle />
          {user && (
            <>
              <Link
                to={paths.profile}
                className="flex items-center gap-2 rounded-lg p-1 transition hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-accent"
              >
                <Avatar name={user.nombre} size="sm" />
                <span className="hidden max-w-[10rem] truncate text-sm font-medium sm:block">
                  {user.nombre}
                </span>
              </Link>
              <button
                type="button"
                onClick={logout}
                aria-label="Cerrar sesión"
                title="Cerrar sesión"
                className="rounded-lg p-2 text-ink-muted transition hover:bg-surface-muted hover:text-danger focus-visible:outline-2 focus-visible:outline-accent"
              >
                <LogOut aria-hidden className="size-5" />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
