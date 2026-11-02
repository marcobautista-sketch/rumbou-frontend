import type { ReactNode } from 'react'
import { Breadcrumbs, type BreadcrumbItem } from '../ui/Breadcrumbs'

interface PageHeaderProps {
  title: string
  description?: string
  // Solo para páginas que cuelgan de otra (un resultado, una pregunta): el menú ya marca el resto.
  breadcrumbs?: BreadcrumbItem[]
  actions?: ReactNode
}

export function PageHeader({ title, description, breadcrumbs, actions }: PageHeaderProps) {
  return (
    <header className="space-y-3">
      {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div className="max-w-2xl space-y-1.5">
          <h1 className="text-[1.75rem] leading-tight font-bold tracking-tight text-balance sm:text-3xl">
            {title}
          </h1>
          {description && <p className="text-pretty text-ink-muted">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
      </div>
    </header>
  )
}
