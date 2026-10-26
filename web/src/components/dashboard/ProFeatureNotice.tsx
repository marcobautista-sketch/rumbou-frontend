import { Crown, Lock } from 'lucide-react'
import { Link } from 'react-router'
import { paths } from '../../routes/paths'
import { buttonStyles } from '../ui/buttonStyles'

interface ProFeatureNoticeProps {
  message: string
}

export function ProFeatureNotice({ message }: ProFeatureNoticeProps) {
  return (
    <div className="flex animate-fade-in flex-col items-center gap-3 rounded-2xl bg-surface-muted px-6 py-8 text-center">
      <span className="rounded-full bg-chip p-3 text-primary">
        <Lock aria-hidden className="size-6" />
      </span>
      <p className="max-w-sm text-ink-muted">{message}</p>
      <Link to={paths.profile} className={buttonStyles('primary', 'sm')}>
        <Crown aria-hidden className="size-4" />
        Pasar a PRO
      </Link>
    </div>
  )
}
