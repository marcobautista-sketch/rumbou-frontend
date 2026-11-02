export type ButtonVariant = 'primary' | 'accent' | 'secondary' | 'danger' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

// primary: la acción principal de la pantalla (una sola). secondary: acciones de apoyo.
// ghost: acciones de texto, como un enlace.
const variants: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-on-primary shadow-card hover:bg-primary-hover',
  accent: 'bg-accent text-on-accent hover:brightness-95',
  secondary:
    'border border-line bg-surface text-ink shadow-card hover:border-ink-muted/40 hover:bg-surface-muted',
  danger: 'bg-danger text-surface hover:brightness-110',
  ghost: 'text-primary hover:bg-chip',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'min-h-9 gap-1.5 rounded-lg px-3 py-1.5 text-sm',
  md: 'min-h-11 gap-2 rounded-xl px-5 py-2.5',
  lg: 'min-h-13 gap-2 rounded-xl px-6 py-3 text-lg',
}

export function buttonStyles(variant: ButtonVariant = 'primary', size: ButtonSize = 'md') {
  return `inline-flex items-center justify-center font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${sizes[size]}`
}
