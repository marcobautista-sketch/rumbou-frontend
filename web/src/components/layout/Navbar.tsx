import { Menu } from 'lucide-react'
import { Link } from 'react-router'
import { useAuth } from '../../hooks/useAuth'
import { paths } from '../../routes/paths'
import { BrandMark } from '../brand/BrandMark'
import { Avatar } from '../ui/Avatar'

interface NavbarProps {
  menuOpen: boolean
  onOpenMenu: () => void
}

// Barra superior solo para celular y tablet: en pantallas grandes todo vive en el menú lateral.
export function Navbar({ menuOpen, onOpenMenu }: NavbarProps) {
  const { user } = useAuth()

  return (
    <header className="sticky top-0 z-30 h-14 border-b border-line bg-surface/90 backdrop-blur lg:hidden">
      <div className="flex h-full items-center justify-between gap-4 px-3 sm:px-5">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onOpenMenu}
            aria-label="Abrir menú"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="rounded-lg p-2 text-ink-muted transition hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-accent"
          >
            <Menu aria-hidden className="size-5" />
          </button>
          <Link
            to={paths.dashboard}
            aria-label="RumboU, ir al inicio"
            className="rounded-lg focus-visible:outline-2 focus-visible:outline-accent"
          >
            <BrandMark size="sm" />
          </Link>
        </div>
        {user && (
          <Link
            to={paths.profile}
            aria-label="Mi perfil"
            className="rounded-full focus-visible:outline-2 focus-visible:outline-accent"
          >
            <Avatar name={user.nombre} size="sm" />
          </Link>
        )}
      </div>
    </header>
  )
}
