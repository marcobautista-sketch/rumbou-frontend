interface BrandLogoProps {
  size?: 'md' | 'lg'
}

export function BrandLogo({ size = 'md' }: BrandLogoProps) {
  const large = size === 'lg'

  return (
    <span className="inline-flex flex-col items-center gap-3">
      <span className="rounded-2xl bg-white p-2 shadow-raised">
        <img src="/logo.png" alt="" className={large ? 'w-24' : 'w-14'} />
      </span>
      <span
        className={`font-display font-bold tracking-tight text-primary ${large ? 'text-5xl' : 'text-2xl'}`}
      >
        RumboU
      </span>
    </span>
  )
}
