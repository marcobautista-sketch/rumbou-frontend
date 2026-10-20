import { LogOut, Menu } from 'lucide-react'
import { Link } from 'react-router'
import { useAuth } from '../../hooks/useAuth'
import { paths } from '../../routes/paths'
import { Avatar } from '../ui/Avatar'
import { ThemeToggle } from '../ui/ThemeToggle'

interface NavbarProps {
  menuOpen: boolean
  onOpenMenu: () => void
}

export function Navbar({ menuOpen, onOpenMenu }: NavbarProps) {
  const { user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <div className="flex h-full items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenMenu}
            aria-label="Abrir menú"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-indigo-500 lg:hidden dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Menu aria-hidden className="size-5" />
          </button>
          <Link
            to={paths.home}
            className="text-xl font-bold text-indigo-600 transition hover:text-indigo-500 dark:text-indigo-400"
          >
            RumboU
          </Link>
        </div>

        <div className="flex items-center gap-1 sm:gap-3">
          <ThemeToggle />
          {user && (
            <>
              <Link
                to={paths.profile}
                className="flex items-center gap-2 rounded-lg p-1 transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-indigo-500 dark:hover:bg-slate-800"
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
                className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 hover:text-red-600 focus-visible:outline-2 focus-visible:outline-indigo-500 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-red-400"
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
