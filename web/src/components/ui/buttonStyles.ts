export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-500 active:bg-indigo-700',
  secondary:
    'border border-slate-300 bg-white hover:bg-slate-100 dark:border-slate-700 dark:bg-transparent dark:hover:bg-slate-800',
  danger: 'bg-red-600 text-white shadow-sm hover:bg-red-500 active:bg-red-700',
  ghost: 'text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-slate-800',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'gap-1.5 rounded-md px-3 py-1.5 text-sm',
  md: 'gap-2 rounded-lg px-4 py-2',
  lg: 'gap-2 rounded-xl px-6 py-3 text-lg',
}

export function buttonStyles(variant: ButtonVariant = 'primary', size: ButtonSize = 'md') {
  return `inline-flex items-center justify-center font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${sizes[size]}`
}
