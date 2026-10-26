import { zodResolver } from '@hookform/resolvers/zod'
import { CircleAlert, Crown } from 'lucide-react'
import { useCallback, useId, useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Link } from 'react-router'
import { z } from 'zod'
import { toApiError, type ApiError } from '../../api/apiError'
import { goalService } from '../../api/goalService'
import { offerService } from '../../api/offerService'
import { useFetch } from '../../hooks/useFetch'
import { paths } from '../../routes/paths'
import type { Goal } from '../../types/goal'
import { notify } from '../../utils/notify'
import { universityNames } from '../../utils/universityLabels'
import { Button } from '../ui/Button'
import { buttonStyles } from '../ui/buttonStyles'
import { Modal } from '../ui/Modal'
import { SelectField } from '../ui/SelectField'

const addGoalSchema = z.object({
  universidad: z.string().min(1, 'Elige una universidad'),
  ofertaAcademicaId: z.string().min(1, 'Elige una carrera'),
})

type AddGoalForm = z.infer<typeof addGoalSchema>

interface AddGoalModalProps {
  open: boolean
  takenOfferIds: number[]
  onClose: () => void
  onAdded: (goal: Goal) => void
}

export function AddGoalModal({ open, takenOfferIds, onClose, onAdded }: AddGoalModalProps) {
  const formId = useId()
  const [rejection, setRejection] = useState<ApiError | null>(null)
  const fetchOffers = useCallback(
    (signal: AbortSignal) => (open ? offerService.search({}, signal) : Promise.resolve(null)),
    [open],
  )
  const offers = useFetch(fetchOffers)
  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AddGoalForm>({
    resolver: zodResolver(addGoalSchema),
    mode: 'onTouched',
    defaultValues: { universidad: '', ofertaAcademicaId: '' },
  })
  const universidad = useWatch({ control, name: 'universidad' })
  const universities = useMemo(
    () => [...new Set(offers.data?.map((offer) => offer.universidad))],
    [offers.data],
  )
  const careers = useMemo(
    () =>
      (offers.data ?? [])
        .filter((offer) => offer.universidad === universidad && !takenOfferIds.includes(offer.id))
        .sort((a, b) => a.carrera.localeCompare(b.carrera, 'es')),
    [offers.data, universidad, takenOfferIds],
  )

  const close = () => {
    reset()
    setRejection(null)
    onClose()
  }

  const onSubmit = async (form: AddGoalForm) => {
    setRejection(null)
    try {
      const goal = await goalService.create(Number(form.ofertaAcademicaId))
      notify.success(`Agregamos ${goal.carrera} a tus objetivos`)
      reset()
      onAdded(goal)
    } catch (error) {
      const apiError = toApiError(error)
      if (apiError.kind === 'forbidden' || apiError.kind === 'conflict') setRejection(apiError)
      else notify.error(apiError)
    }
  }

  return (
    <Modal
      open={open}
      title="Agregar carrera objetivo"
      description="Compararemos tus simulacros con el puntaje del último ingresante de esa carrera."
      dismissible={!isSubmitting}
      onClose={close}
      footer={
        <>
          <Button variant="secondary" onClick={close} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" form={formId} loading={isSubmitting}>
            Agregar objetivo
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <SelectField
          label="Universidad"
          disabled={offers.loading}
          error={errors.universidad?.message ?? offers.error?.message}
          {...register('universidad', { onChange: () => setValue('ofertaAcademicaId', '') })}
        >
          <option value="">{offers.loading ? 'Cargando…' : 'Selecciona una universidad'}</option>
          {universities.map((siglas) => (
            <option key={siglas} value={siglas}>
              {universityNames[siglas] ?? siglas}
            </option>
          ))}
        </SelectField>
        <SelectField
          label="Carrera"
          disabled={!universidad}
          error={errors.ofertaAcademicaId?.message}
          {...register('ofertaAcademicaId')}
        >
          <option value="">
            {universidad ? 'Selecciona una carrera' : 'Primero elige la universidad'}
          </option>
          {careers.map((offer) => (
            <option key={offer.id} value={offer.id}>
              {offer.carrera}
            </option>
          ))}
        </SelectField>

        {rejection && (
          <div
            role="alert"
            className="flex animate-fade-in flex-col gap-3 rounded-2xl border border-danger/30 bg-danger-soft p-4 text-danger"
          >
            <p className="flex gap-2">
              <CircleAlert aria-hidden className="mt-0.5 size-5 shrink-0" />
              {rejection.message}
            </p>
            {rejection.kind === 'forbidden' && (
              <Link to={paths.profile} className={`${buttonStyles('primary', 'sm')} self-start`}>
                <Crown aria-hidden className="size-4" />
                Pasar a PRO para seguir hasta 3 carreras
              </Link>
            )}
          </div>
        )}
      </form>
    </Modal>
  )
}
