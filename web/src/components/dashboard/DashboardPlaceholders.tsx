import { Skeleton } from '../ui/Skeleton'

// Lo que se ve en una tarjeta del panel mientras llegan sus datos.
export function CardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-6 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  )
}
