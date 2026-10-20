import { LoaderCircle } from 'lucide-react'

type SpinnerSize = 'sm' | 'md' | 'lg'

const sizes: Record<SpinnerSize, string> = {
  sm: 'size-4',
  md: 'size-6',
  lg: 'size-10',
}

interface SpinnerProps {
  size?: SpinnerSize
  label?: string
}

export function Spinner({ size = 'md', label = 'Cargando…' }: SpinnerProps) {
  return (
    <span role="status" className="inline-flex items-center gap-2">
      <LoaderCircle aria-hidden className={`animate-spin text-accent-ink ${sizes[size]}`} />
      <span className="sr-only">{label}</span>
    </span>
  )
}
