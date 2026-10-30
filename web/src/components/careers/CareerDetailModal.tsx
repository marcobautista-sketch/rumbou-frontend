import { Flag, Plus } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { toApiError, type ApiError } from '../../api/apiError'
import { goalService } from '../../api/goalService'
import { paths } from '../../routes/paths'
import type { AcademicOffer } from '../../types/offer'
import { formatScore } from '../../utils/format'
import { notify } from '../../utils/notify'
import { universityNames } from '../../utils/universityLabels'
import { GoalRejectionAlert } from '../dashboard/GoalRejectionAlert'
import { Button } from '../ui/Button'
import { buttonStyles } from '../ui/buttonStyles'
import { Modal } from '../ui/Modal'

interface CareerDetailModalProps {
  offer: AcademicOffer | null
  isGoal: boolean
  onClose: () => void
  onAdded: () => void
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm text-ink-muted">{label}</dt>
      <dd className="font-medium break-words">{value}</dd>
    </div>
  )
}

export function CareerDetailModal({ offer, isGoal, onClose, onAdded }: CareerDetailModalProps) {
  const [adding, setAdding] = useState(false)
  const [rejection, setRejection] = useState<ApiError | null>(null)

  const addGoal = async () => {
    if (!offer) return
    setAdding(true)
    setRejection(null)
    try {
      await goalService.create(offer.id)
      notify.success(`Agregamos ${offer.carrera} a tus objetivos`)
      onAdded()
    } catch (error) {
      const apiError = toApiError(error)
      if (apiError.kind === 'forbidden' || apiError.kind === 'conflict') setRejection(apiError)
      else notify.error(apiError)
    } finally {
      setAdding(false)
    }
  }

  return (
    <Modal
      open={offer !== null}
      title={offer?.carrera ?? ''}
      description={offer?.facultad}
      size="lg"
      dismissible={!adding}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={adding}>
            Cerrar
          </Button>
          {isGoal ? (
            <Link to={paths.progress} className={buttonStyles('primary')}>
              <Flag aria-hidden className="size-4" />
              Ver mis objetivos
            </Link>
          ) : (
            <Button onClick={addGoal} loading={adding}>
              <Plus aria-hidden className="size-4" />
              Agregar a mis objetivos
            </Button>
          )}
        </>
      }
    >
      {offer && (
        <div className="space-y-4">
          <dl className="grid gap-4 sm:grid-cols-2">
            <DetailItem
              label="Universidad"
              value={universityNames[offer.universidad] ?? offer.universidad}
            />
            <DetailItem label="Área del examen" value={`${offer.areaNombre} (${offer.area})`} />
            <DetailItem label="Proceso de admisión" value={offer.procesoAdmision} />
            <DetailItem label="Vacantes" value={String(offer.vacantes)} />
          </dl>
          <div className="rounded-2xl bg-surface-muted p-4">
            <p className="text-sm text-ink-muted">Puntaje del último ingresante</p>
            <p className="font-display text-3xl font-bold">
              {formatScore(offer.puntajeUltimoIngresante)}
            </p>
            <p className="mt-1 text-sm text-ink-muted">
              {isGoal
                ? 'Ya sigues esta carrera: comparamos cada simulacro de esta área con este puntaje.'
                : 'Agrégala a tus objetivos y compararemos tus simulacros con este puntaje.'}
            </p>
          </div>
          {rejection && <GoalRejectionAlert error={rejection} />}
        </div>
      )}
    </Modal>
  )
}
