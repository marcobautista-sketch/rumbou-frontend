import { Lock, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { toApiError, type ApiError } from '../../api/apiError'
import { questionService } from '../../api/questionService'
import { paths } from '../../routes/paths'
import { Button } from '../ui/Button'
import { buttonStyles } from '../ui/buttonStyles'
import { Card } from '../ui/Card'
import { Skeleton } from '../ui/Skeleton'

interface TutorPanelProps {
  questionId: number
  markedAlternative?: number | null
}

export function TutorPanel({ questionId, markedAlternative }: TutorPanelProps) {
  const [explanation, setExplanation] = useState<string | null>(null)
  const [error, setError] = useState<ApiError | null>(null)
  const [loading, setLoading] = useState(false)

  const askTutor = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await questionService.askTutor(questionId, markedAlternative)
      setExplanation(response.explicacion)
    } catch (caught) {
      setError(toApiError(caught))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card aria-labelledby="tutor-title" aria-busy={loading} className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="rounded-xl bg-accent p-2 text-on-accent">
            <Sparkles aria-hidden className="size-5" />
          </span>
          <div>
            <h2 id="tutor-title" className="font-semibold">
              Tutor con IA
            </h2>
            <p className="text-sm text-ink-muted">
              {markedAlternative == null
                ? 'Te explica paso a paso cómo resolver esta pregunta.'
                : 'Te explica por qué tu respuesta era tentadora y cómo resolverla.'}
            </p>
          </div>
        </div>
        {!explanation && (
          <Button onClick={askTutor} loading={loading}>
            {loading ? 'Pensando…' : 'Explicación del tutor'}
          </Button>
        )}
      </div>

      {loading && (
        <div
          role="status"
          aria-label="El tutor está preparando la explicación"
          className="space-y-2"
        >
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      )}

      {error?.kind === 'forbidden' && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl bg-warning/10 p-4 text-warning">
          <Lock aria-hidden className="size-5 shrink-0" />
          <p className="flex-1">{error.message}</p>
          <Link to={paths.profile} className={buttonStyles('primary', 'sm')}>
            Ver planes
          </Link>
        </div>
      )}

      {error && error.kind !== 'forbidden' && (
        <p role="alert" className="text-danger">
          {error.kind === 'unavailable'
            ? 'El tutor no está disponible en este momento. Intenta en unos minutos.'
            : error.message}{' '}
          <button type="button" onClick={askTutor} className="font-medium underline">
            Intentar de nuevo
          </button>
        </p>
      )}

      {explanation && (
        <div className="animate-fade-in rounded-xl bg-accent-soft p-4 leading-relaxed whitespace-pre-line">
          {explanation}
        </div>
      )}
    </Card>
  )
}
