import { CircleAlert, Crown } from 'lucide-react'
import { Link } from 'react-router'
import type { ApiError } from '../../api/apiError'
import { paths } from '../../routes/paths'
import { buttonStyles } from '../ui/buttonStyles'

interface GoalRejectionAlertProps {
  error: ApiError
}

export function GoalRejectionAlert({ error }: GoalRejectionAlertProps) {
  return (
    <div
      role="alert"
      className="flex animate-fade-in flex-col gap-3 rounded-2xl border border-danger/30 bg-danger-soft p-4 text-danger"
    >
      <p className="flex gap-2">
        <CircleAlert aria-hidden className="mt-0.5 size-5 shrink-0" />
        {error.message}
      </p>
      {error.kind === 'forbidden' && (
        <Link to={paths.profile} className={`${buttonStyles('primary', 'sm')} self-start`}>
          <Crown aria-hidden className="size-4" />
          Pasar a PRO para seguir hasta 3 carreras
        </Link>
      )}
    </div>
  )
}
