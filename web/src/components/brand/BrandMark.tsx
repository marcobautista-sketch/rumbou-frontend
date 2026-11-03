type BrandSize = 'sm' | 'md' | 'lg'

const logoSizes: Record<BrandSize, string> = {
  sm: 'size-6',
  md: 'size-7',
  lg: 'size-10',
}

const wordSizes: Record<BrandSize, string> = {
  sm: 'text-lg',
  md: 'text-xl',
  lg: 'text-3xl',
}

interface BrandMarkProps {
  size?: BrandSize
}

// El logo original de RumboU sobre su recuadro blanco (así se lee también en modo oscuro) y el
// nombre en el azul de la marca.
export function BrandMark({ size = 'md' }: BrandMarkProps) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className="inline-flex shrink-0 rounded-lg bg-white p-1 shadow-card">
        <img src="/logo.png" alt="" className={logoSizes[size]} />
      </span>
      <span className={`font-display font-bold tracking-tight text-primary ${wordSizes[size]}`}>
        RumboU
      </span>
    </span>
  )
}
