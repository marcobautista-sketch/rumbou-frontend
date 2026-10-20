import { Suspense, useCallback, useState } from 'react'
import { Outlet } from 'react-router'
import { Spinner } from '../ui/Spinner'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'

export function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = useCallback(() => setMenuOpen(false), [])

  return (
    <div className="min-h-screen">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-indigo-600 focus:px-4 focus:py-2 focus:text-white"
      >
        Saltar al contenido
      </a>
      <Navbar menuOpen={menuOpen} onOpenMenu={() => setMenuOpen(true)} />
      <div className="flex">
        <Sidebar open={menuOpen} onClose={closeMenu} />
        <div id="content" className="min-w-0 flex-1 animate-fade-in">
          <Suspense
            fallback={
              <div className="flex justify-center py-24">
                <Spinner size="lg" />
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
