import { NotebookPen } from 'lucide-react'
import { Link } from 'react-router'
import { paths } from '../../routes/paths'
import { buttonStyles } from '../ui/buttonStyles'
import { EmptyState } from '../ui/EmptyState'
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

export function FirstExamEmptyState() {
  return (
    <EmptyState
      icon={NotebookPen}
      title="Aún no tienes resultados"
      message="Rinde un simulacro para medir tu puntaje y compararlo con el del último ingresante."
      action={
        <Link to={paths.newExam} className={buttonStyles('primary')}>
          Rinde tu primer simulacro
        </Link>
      }
    />
  )
}
