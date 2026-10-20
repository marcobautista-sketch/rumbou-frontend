import type { ReactNode } from 'react'

export interface TableColumn<T> {
  key: string
  header: ReactNode
  render: (row: T) => ReactNode
  className?: string
}

interface TableProps<T> {
  caption: string
  columns: TableColumn<T>[]
  rows: T[]
  rowKey: (row: T) => string | number
  isRowSelected?: (row: T) => boolean
}

export function Table<T>({ caption, columns, rows, rowKey, isRowSelected }: TableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-2xl bg-surface shadow-card">
      <table className="w-full text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className="border-b border-line bg-surface-muted text-xs tracking-wide text-ink-muted uppercase">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={`px-4 py-3 font-medium ${column.className ?? ''}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              className={`transition ${
                isRowSelected?.(row) ? 'bg-accent-soft' : 'hover:bg-surface-muted'
              }`}
            >
              {columns.map((column) => (
                <td key={column.key} className={`px-4 py-3 align-top ${column.className ?? ''}`}>
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
