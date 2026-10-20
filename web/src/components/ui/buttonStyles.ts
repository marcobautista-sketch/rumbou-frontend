export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-500',
  secondary:
    'border border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800',
  danger: 'bg-red-600 text-white hover:bg-red-500',
  ghost: 'text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-slate-800',
}

export function buttonStyles(variant: ButtonVariant = 'primary') {
  return `inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]}`
}
