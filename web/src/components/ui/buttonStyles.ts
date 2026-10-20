export type ButtonVariant = 'primary' | 'accent' | 'secondary' | 'danger' | 'ghost'

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-on-primary shadow-raised hover:bg-primary-hover',
  accent: 'bg-accent text-on-accent hover:brightness-95',
  secondary: 'border-2 border-primary text-primary hover:bg-surface-muted',
  danger: 'bg-danger text-white hover:brightness-110',
  ghost: 'text-accent-ink hover:bg-surface-muted',
}

export function buttonStyles(variant: ButtonVariant = 'primary') {
  return `inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 py-2.5 font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]}`
}
