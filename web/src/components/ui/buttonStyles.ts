export type ButtonVariant = 'primary' | 'accent' | 'secondary' | 'danger' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-on-primary shadow-raised hover:bg-primary-hover',
  accent: 'bg-accent text-on-accent hover:brightness-95',
  secondary: 'border-2 border-primary text-primary hover:bg-surface-muted',
  danger: 'bg-danger text-surface hover:brightness-110',
  ghost: 'text-accent-ink hover:bg-surface-muted',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'min-h-9 gap-1.5 rounded-lg px-3 py-1.5 text-sm',
  md: 'min-h-11 gap-2 rounded-xl px-5 py-2.5',
  lg: 'min-h-13 gap-2 rounded-xl px-6 py-3 text-lg',
}

export function buttonStyles(variant: ButtonVariant = 'primary', size: ButtonSize = 'md') {
  return `inline-flex items-center justify-center font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${sizes[size]}`
}
