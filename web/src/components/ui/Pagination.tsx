import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useId } from 'react'
import { PAGE_SIZES } from '../../hooks/usePagination'

interface PaginationProps {
  page: number
  size: number
  totalElements: number
  totalPages: number
  itemLabel?: string
  onPageChange: (page: number) => void
  onSizeChange: (size: number) => void
}

type PageItem = number | 'gap'

function visiblePages(current: number, total: number): PageItem[] {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1)

  const around = [current - 1, current, current + 1].filter((page) => page > 1 && page < total)
  const pages: PageItem[] = [1]
  if (around[0] > 2) pages.push('gap')
  pages.push(...around)
  if (around[around.length - 1] < total - 1) pages.push('gap')
  pages.push(total)
  return pages
}

const pageButton =
  'inline-flex size-9 items-center justify-center rounded-lg text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-40'

export function Pagination({
  page,
  size,
  totalElements,
  totalPages,
  itemLabel = 'resultados',
  onPageChange,
  onSizeChange,
}: PaginationProps) {
  const sizeSelectId = useId()
  const from = totalElements === 0 ? 0 : (page - 1) * size + 1
  const to = Math.min(page * size, totalElements)

  return (
    <div className="flex flex-col items-center justify-between gap-4 text-sm sm:flex-row">
      <p className="text-ink-muted" aria-live="polite">
        Mostrando <strong className="text-ink">{from}</strong>–
        <strong className="text-ink">{to}</strong> de{' '}
        <strong className="text-ink">{totalElements}</strong> {itemLabel}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <div className="flex items-center gap-2">
          <label htmlFor={sizeSelectId} className="text-ink-muted">
            Por página
          </label>
          <select
            id={sizeSelectId}
            value={size}
            onChange={(event) => onSizeChange(Number(event.target.value))}
            className="rounded-lg border border-line bg-surface px-2 py-1.5 focus:ring-2 focus:ring-accent focus:outline-none"
          >
            {PAGE_SIZES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <nav aria-label="Paginación" className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            aria-label="Página anterior"
            className={`${pageButton} hover:bg-surface-muted`}
          >
            <ChevronLeft aria-hidden className="size-4" />
          </button>
          {visiblePages(page, Math.max(totalPages, 1)).map((item, index) =>
            item === 'gap' ? (
              <span key={`gap-${index}`} aria-hidden className="px-1 text-ink-muted">
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => onPageChange(item)}
                aria-label={`Página ${item}`}
                aria-current={item === page ? 'page' : undefined}
                className={`${pageButton} ${
                  item === page
                    ? 'bg-primary text-on-primary shadow-card'
                    : 'hover:bg-surface-muted'
                }`}
              >
                {item}
              </button>
            ),
          )}
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            aria-label="Página siguiente"
            className={`${pageButton} hover:bg-surface-muted`}
          >
            <ChevronRight aria-hidden className="size-4" />
          </button>
        </nav>
      </div>
    </div>
  )
}
