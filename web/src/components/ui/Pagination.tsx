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
  'inline-flex size-9 items-center justify-center rounded-lg text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-indigo-500 disabled:cursor-not-allowed disabled:opacity-40'

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
      <p className="text-slate-600 dark:text-slate-400" aria-live="polite">
        Mostrando <strong className="text-slate-900 dark:text-slate-100">{from}</strong>–
        <strong className="text-slate-900 dark:text-slate-100">{to}</strong> de{' '}
        <strong className="text-slate-900 dark:text-slate-100">{totalElements}</strong> {itemLabel}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <div className="flex items-center gap-2">
          <label htmlFor={sizeSelectId} className="text-slate-600 dark:text-slate-400">
            Por página
          </label>
          <select
            id={sizeSelectId}
            value={size}
            onChange={(event) => onSizeChange(Number(event.target.value))}
            className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 focus:ring-2 focus:ring-indigo-200 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:focus:ring-indigo-900"
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
            className={`${pageButton} hover:bg-slate-100 dark:hover:bg-slate-800`}
          >
            <ChevronLeft aria-hidden className="size-4" />
          </button>
          {visiblePages(page, Math.max(totalPages, 1)).map((item, index) =>
            item === 'gap' ? (
              <span key={`gap-${index}`} aria-hidden className="px-1 text-slate-400">
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
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800'
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
            className={`${pageButton} hover:bg-slate-100 dark:hover:bg-slate-800`}
          >
            <ChevronRight aria-hidden className="size-4" />
          </button>
        </nav>
      </div>
    </div>
  )
}
