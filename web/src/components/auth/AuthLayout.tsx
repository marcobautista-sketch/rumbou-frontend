import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { paths } from '../../routes/paths'

interface AuthLayoutProps {
  title: string
  subtitle: string
  footer: ReactNode
  children: ReactNode
}

export function AuthLayout({ title, subtitle, footer, children }: AuthLayoutProps) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="space-y-1 text-center">
          <Link to={paths.home} className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            RumboU
          </Link>
          <h1 className="text-xl font-semibold">{title}</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">{subtitle}</p>
        </div>
        {children}
        <p className="text-center text-sm text-slate-600 dark:text-slate-400">{footer}</p>
      </div>
    </main>
  )
}
