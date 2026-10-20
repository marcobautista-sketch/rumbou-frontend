interface SkeletonProps {
  className?: string
}

export function Skeleton({ className = 'h-4 w-full' }: SkeletonProps) {
  return <div aria-hidden className={`animate-pulse rounded-lg bg-line ${className}`} />
}

interface SkeletonListProps {
  rows?: number
  label?: string
}

export function SkeletonList({ rows = 5, label = 'Cargando…' }: SkeletonListProps) {
  return (
    <div role="status" aria-label={label} className="space-y-3">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="space-y-3 rounded-2xl bg-surface p-5 shadow-card">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ))}
    </div>
  )
}
