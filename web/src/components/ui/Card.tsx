import type { ComponentProps } from 'react'

interface CardProps extends ComponentProps<'section'> {
  interactive?: boolean
}

export function Card({ interactive = false, className = '', children, ...props }: CardProps) {
  return (
    <section
      className={`rounded-2xl bg-surface p-6 shadow-card ${
        interactive ? 'transition hover:-translate-y-0.5 hover:shadow-raised' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </section>
  )
}
