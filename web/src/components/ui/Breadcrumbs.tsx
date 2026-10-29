import { ChevronRight, House } from 'lucide-react'
import { Link } from 'react-router'
import { paths } from '../../routes/paths'

export interface BreadcrumbItem {
  label: string
  to?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Ubicación" className="text-sm">
      <ol className="flex flex-wrap items-center gap-1.5 text-ink-muted">
        <li>
          <Link
            to={paths.dashboard}
            aria-label="Inicio"
            className="flex items-center rounded transition hover:text-accent-ink"
          >
            <House aria-hidden className="size-4" />
          </Link>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
              <ChevronRight aria-hidden className="size-3.5" />
              {item.to && !isLast ? (
                <Link to={item.to} className="rounded transition hover:text-accent-ink">
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? 'page' : undefined}
                  className="max-w-[16rem] truncate font-medium text-ink"
                >
                  {item.label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
