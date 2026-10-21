import {
  Camera,
  CircleAlert,
  CircleCheck,
  CircleX,
  EyeOff,
  Lock,
  PenLine,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useState, type ChangeEvent } from 'react'
import { Link } from 'react-router'
import { toApiError, type ApiError } from '../../api/apiError'
import { solutionService } from '../../api/solutionService'
import { paths } from '../../routes/paths'
import type { SolutionReview, SolutionVerdict } from '../../types/solution'
import { formatMath } from '../../utils/formatMath'
import { Button } from '../ui/Button'
import { buttonStyles } from '../ui/buttonStyles'
import { Card } from '../ui/Card'
import { Modal } from '../ui/Modal'
import { Whiteboard } from './Whiteboard'

const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const ACCEPTED_TYPES = 'image/jpeg,image/png,image/webp,image/heic,image/heif'

const verdicts: Record<SolutionVerdict, { title: string; icon: LucideIcon; tone: string }> = {
  CORRECTA: {
    title: 'Procedimiento correcto',
    icon: CircleCheck,
    tone: 'bg-success/10 text-success',
  },
  PARCIAL: {
    title: 'Vas bien, pero hay un error',
    icon: CircleAlert,
    tone: 'bg-accent-soft text-accent-ink',
  },
  INCORRECTA: {
    title: 'Revisa tu planteamiento',
    icon: CircleX,
    tone: 'bg-danger-soft text-danger',
  },
  ILEGIBLE: {
    title: 'No pude leer tu imagen',
    icon: EyeOff,
    tone: 'bg-surface-muted text-ink-muted',
  },
}

interface SolutionImage {
  blob: Blob
  name: string
  url: string
}

interface SolutionReviewPanelProps {
  questionId: number
  statement: string
}

// Sensores de la web: foto del procedimiento en papel o la pizarra, revisadas por el tutor.
export function SolutionReviewPanel({ questionId, statement }: SolutionReviewPanelProps) {
  const [image, setImage] = useState<SolutionImage | null>(null)
  const [review, setReview] = useState<SolutionReview | null>(null)
  const [error, setError] = useState<ApiError | string | null>(null)
  const [sending, setSending] = useState(false)
  const [boardOpen, setBoardOpen] = useState(false)

  useEffect(() => {
    if (!image) return
    return () => URL.revokeObjectURL(image.url)
  }, [image])

  const selectImage = (blob: Blob, name: string) => {
    setReview(null)
    if (blob.size > MAX_IMAGE_BYTES) {
      setError('La imagen pesa más de 5 MB. Recórtala a tu procedimiento o usa otra.')
      return
    }
    setError(null)
    setImage({ blob, name, url: URL.createObjectURL(blob) })
  }

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (file) selectImage(file, file.name)
  }

  const send = async () => {
    if (!image) return
    setSending(true)
    setError(null)
    try {
      setReview(await solutionService.review(questionId, image.blob, image.name))
    } catch (caught) {
      setError(toApiError(caught))
    } finally {
      setSending(false)
    }
  }

  const verdict = review && verdicts[review.veredicto]
  const apiError = typeof error === 'string' ? null : error

  return (
    <Card aria-labelledby="solution-title" aria-busy={sending} className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="rounded-xl bg-accent p-2 text-on-accent">
          <PenLine aria-hidden className="size-5" />
        </span>
        <div>
          <h2 id="solution-title" className="font-semibold">
            Muéstrale tu procedimiento al tutor
          </h2>
          <p className="text-sm text-ink-muted">
            Sube una foto de lo que resolviste en papel o escríbelo en la pizarra. El tutor te dirá
            en qué paso está el error.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <label
          className={`${buttonStyles('secondary', 'sm')} cursor-pointer focus-within:outline-2 focus-within:outline-accent`}
        >
          <Camera aria-hidden className="size-4" /> Subir foto
          <input
            type="file"
            accept={ACCEPTED_TYPES}
            onChange={onFileChange}
            disabled={sending}
            className="sr-only"
          />
        </label>
        <Button variant="secondary" size="sm" onClick={() => setBoardOpen(true)} disabled={sending}>
          <PenLine aria-hidden className="size-4" /> Usar la pizarra
        </Button>
      </div>

      {image && (
        <img
          src={image.url}
          alt="Tu procedimiento"
          className="max-h-72 w-full rounded-xl bg-surface-muted object-contain"
        />
      )}

      {image && !review && (
        <Button onClick={send} loading={sending}>
          {sending ? 'El tutor está revisando…' : 'Enviar al tutor'}
        </Button>
      )}

      {typeof error === 'string' && (
        <p role="alert" className="text-danger">
          {error}
        </p>
      )}

      {apiError?.kind === 'forbidden' && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl bg-warning/10 p-4 text-warning">
          <Lock aria-hidden className="size-5 shrink-0" />
          <p className="flex-1">{apiError.message}</p>
          <Link to={paths.profile} className={buttonStyles('primary', 'sm')}>
            Ver planes
          </Link>
        </div>
      )}

      {apiError && apiError.kind !== 'forbidden' && (
        <p role="alert" className="text-danger">
          {apiError.kind === 'unavailable'
            ? 'El tutor no está disponible en este momento. Intenta en unos minutos.'
            : apiError.message}
        </p>
      )}

      {review && verdict && (
        <div role="status" className={`animate-fade-in space-y-2 rounded-xl p-4 ${verdict.tone}`}>
          <p className="flex items-center gap-2 font-semibold">
            <verdict.icon aria-hidden className="size-5" /> {verdict.title}
          </p>
          <p className="leading-relaxed whitespace-pre-line text-ink">
            {formatMath(review.retroalimentacion)}
          </p>
        </div>
      )}

      <Modal
        open={boardOpen}
        title="Pizarra"
        description="Resuelve la pregunta como lo harías en papel. Con un lápiz de tablet, la palma no dibuja."
        size="lg"
        onClose={() => setBoardOpen(false)}
      >
        <Whiteboard
          statement={statement}
          onCancel={() => setBoardOpen(false)}
          onDone={(blob) => {
            setBoardOpen(false)
            selectImage(blob, 'pizarra.png')
          }}
        />
      </Modal>
    </Card>
  )
}
