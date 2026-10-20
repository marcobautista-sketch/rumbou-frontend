import type { ComponentProps } from 'react'

interface CardProps extends ComponentProps<'section'> {
  interactive?: boolean
}

export function Card({ interactive = false, className = '', children, ...props }: CardProps) {
  return (
    <section
      className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 ${
        interactive
          ? 'transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md dark:hover:border-indigo-700'
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </section>
  )
}
