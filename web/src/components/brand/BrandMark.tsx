type BrandSize = 'sm' | 'md' | 'lg'

const markSizes: Record<BrandSize, string> = {
  sm: 'size-7',
  md: 'size-8',
  lg: 'size-12',
}

const wordSizes: Record<BrandSize, string> = {
  sm: 'text-lg',
  md: 'text-xl',
  lg: 'text-3xl',
}

// Isotipo de RumboU: un libro abierto del que sale una flecha hacia arriba (el rumbo a la
// universidad). Es un SVG con los colores del tema, así se ve nítido y cambia con el modo oscuro.
export function BrandIcon({ className = 'size-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden className={`shrink-0 ${className}`}>
      <rect width="40" height="40" rx="11" className="fill-primary" />
      <path
        d="M20 17.6c-3.6-2.3-8.2-2.8-12.4-1.4v12.6c4.2-1.4 8.8-.9 12.4 1.4 3.6-2.3 8.2-2.8 12.4-1.4V16.2c-4.2-1.4-8.8-.9-12.4 1.4Z"
        className="fill-on-primary"
      />
      <path d="M20 18.2v11.6" strokeWidth="1.6" strokeLinecap="round" className="stroke-primary" />
      <path
        d="M20 15.2V7.4M15.6 11.6 20 7.2l4.4 4.4"
        fill="none"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-on-primary"
      />
    </svg>
  )
}

interface BrandMarkProps {
  size?: BrandSize
}

export function BrandMark({ size = 'md' }: BrandMarkProps) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <BrandIcon className={markSizes[size]} />
      <span className={`font-display font-extrabold tracking-tight text-ink ${wordSizes[size]}`}>
        Rumbo<span className="text-primary">U</span>
      </span>
    </span>
  )
}
