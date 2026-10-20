import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { paths } from '../../routes/paths'
import { BrandLogo } from '../brand/BrandLogo'

interface AuthLayoutProps {
  title: string
  subtitle: string
  footer: ReactNode
  children: ReactNode
}

export function AuthLayout({ title, subtitle, footer, children }: AuthLayoutProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-linear-to-br from-canvas via-surface-muted to-accent-soft px-4 py-10">
      <div className="w-full max-w-md space-y-6 rounded-2xl bg-surface/90 p-8 shadow-raised backdrop-blur">
        <div className="space-y-2 text-center">
          <Link to={paths.home} aria-label="Ir al inicio de RumboU">
            <BrandLogo />
          </Link>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-ink-muted">{subtitle}</p>
        </div>
        {children}
        <p className="text-center text-sm text-ink-muted">{footer}</p>
      </div>
    </main>
  )
}
