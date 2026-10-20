import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, ArrowRight, Flag } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Link } from 'react-router'
import { toApiError } from '../../api/apiError'
import { goalService } from '../../api/goalService'
import { offerService } from '../../api/offerService'
import { AuthLayout } from '../../components/auth/AuthLayout'
import { Button } from '../../components/ui/Button'
import { SelectField } from '../../components/ui/SelectField'
import { TextField } from '../../components/ui/TextField'
import { useAuth } from '../../hooks/useAuth'
import { useFetch } from '../../hooks/useFetch'
import { paths } from '../../routes/paths'
import { notify } from '../../utils/notify'
import { registerSchema, type RegisterForm } from './authSchemas'

const steps = [
  {
    title: 'Cuéntanos sobre ti',
    subtitle: 'Así personalizamos tu preparación.',
    fields: ['nombre', 'apellidos', 'telefono'],
  },
  {
    title: 'Crea tu cuenta',
    subtitle: 'Con este correo entrarás a RumboU.',
    fields: ['email', 'password', 'confirmPassword'],
  },
  {
    title: '¿Cuál es tu meta?',
    subtitle: 'Enfocamos cada simulacro en el examen de la universidad que elijas.',
    fields: ['universidad', 'ofertaAcademicaId'],
  },
] as const satisfies readonly {
  title: string
  subtitle: string
  fields: readonly (keyof RegisterForm)[]
}[]

const universityNames: Record<string, string> = {
  UNI: 'Universidad Nacional de Ingeniería (UNI)',
  UNMSM: 'Universidad Nacional Mayor de San Marcos (UNMSM)',
}

export default function RegisterPage() {
  const [step, setStep] = useState(0)
  const { register: createAccount } = useAuth()
  const {
    register,
    handleSubmit,
    trigger,
    setError,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
    defaultValues: {
      nombre: '',
      apellidos: '',
      telefono: '',
      email: '',
      password: '',
      confirmPassword: '',
      universidad: '',
      ofertaAcademicaId: '',
    },
  })
  const universidad = useWatch({ control, name: 'universidad' })
  const fetchOffers = useCallback((signal: AbortSignal) => offerService.search({}, signal), [])
  const offers = useFetch(fetchOffers)
  const universities = useMemo(
    () => [...new Set(offers.data?.map((offer) => offer.universidad))],
    [offers.data],
  )
  const careers = useMemo(
    () =>
      (offers.data ?? [])
        .filter((offer) => offer.universidad === universidad)
        .sort((a, b) => a.carrera.localeCompare(b.carrera, 'es')),
    [offers.data, universidad],
  )
  const current = steps[step]
  const isLastStep = step === steps.length - 1

  const goNext = async () => {
    if (await trigger([...current.fields])) setStep((value) => value + 1)
  }

  const onSubmit = async (form: RegisterForm) => {
    try {
      await createAccount({
        nombre: form.nombre,
        apellidos: form.apellidos,
        telefono: form.telefono || undefined,
        email: form.email,
        password: form.password,
      })
    } catch (error) {
      const apiError = toApiError(error)
      if (apiError.kind === 'conflict') {
        setStep(1)
        setError('email', { message: 'Ya existe una cuenta con este correo' })
      } else {
        notify.error(apiError)
      }
      return
    }
    try {
      await goalService.create(Number(form.ofertaAcademicaId))
      notify.success('¡Tu cuenta está lista y tu meta, guardada!')
    } catch (error) {
      notify.error(error)
    }
  }

  return (
    <AuthLayout
      title={current.title}
      subtitle={current.subtitle}
      footer={
        <>
          ¿Ya tienes cuenta?{' '}
          <Link to={paths.login} className="font-semibold text-accent-ink">
            Inicia sesión
          </Link>
        </>
      }
    >
      <div className="flex items-center gap-3">
        <div
          role="progressbar"
          aria-label="Avance del registro"
          aria-valuemin={1}
          aria-valuemax={steps.length}
          aria-valuenow={step + 1}
          className="h-2 flex-1 overflow-hidden rounded-full bg-surface-muted"
        >
          <div
            className="h-full rounded-full bg-accent transition-all"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>
        <span className="text-sm font-semibold text-ink-muted">
          Paso {step + 1} de {steps.length}
        </span>
      </div>

      <form
        onSubmit={isLastStep ? handleSubmit(onSubmit) : (event) => event.preventDefault()}
        noValidate
        className="space-y-4"
      >
        {step === 0 && (
          <>
            <TextField
              label="Nombres"
              autoComplete="given-name"
              placeholder="¿Cómo te llamas?"
              error={errors.nombre?.message}
              {...register('nombre')}
            />
            <TextField
              label="Apellidos"
              autoComplete="family-name"
              error={errors.apellidos?.message}
              {...register('apellidos')}
            />
            <TextField
              label="Celular (opcional)"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              placeholder="987654321"
              hint="Solo para avisarte de tus simulacros. No lo compartimos."
              error={errors.telefono?.message}
              {...register('telefono')}
            />
          </>
        )}

        {step === 1 && (
          <>
            <TextField
              label="Correo"
              type="email"
              autoComplete="email"
              placeholder="nombre@correo.com"
              error={errors.email?.message}
              {...register('email')}
            />
            <TextField
              label="Contraseña"
              type="password"
              autoComplete="new-password"
              hint="Mínimo 8 caracteres, con una mayúscula, una minúscula y un número."
              error={errors.password?.message}
              {...register('password')}
            />
            <TextField
              label="Repite tu contraseña"
              type="password"
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />
          </>
        )}

        {step === 2 && (
          <>
            <SelectField
              label="Universidad a la que postulas"
              disabled={offers.loading}
              error={errors.universidad?.message ?? offers.error?.message}
              {...register('universidad', { onChange: () => setValue('ofertaAcademicaId', '') })}
            >
              <option value="">
                {offers.loading ? 'Cargando…' : 'Selecciona una universidad'}
              </option>
              {universities.map((siglas) => (
                <option key={siglas} value={siglas}>
                  {universityNames[siglas] ?? siglas}
                </option>
              ))}
            </SelectField>
            <SelectField
              label="Carrera que deseas estudiar"
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
            <div className="flex gap-3 rounded-xl bg-surface-muted p-4">
              <Flag aria-hidden className="mt-0.5 size-5 shrink-0 text-primary" />
              <p className="text-sm text-ink-muted">
                <strong className="block text-ink">Tu camino está por comenzar</strong>
                Con tu meta comparamos tus simulacros con el puntaje del último ingresante de esa
                carrera.
              </p>
            </div>
          </>
        )}

        <div className="flex gap-3">
          {step > 0 && (
            <Button variant="secondary" onClick={() => setStep((value) => value - 1)}>
              <ArrowLeft aria-hidden className="size-4" />
              Atrás
            </Button>
          )}
          {isLastStep ? (
            <Button type="submit" loading={isSubmitting} className="flex-1">
              Finalizar registro
              <ArrowRight aria-hidden className="size-4" />
            </Button>
          ) : (
            <Button onClick={goNext} className="flex-1">
              Siguiente
              <ArrowRight aria-hidden className="size-4" />
            </Button>
          )}
        </div>
      </form>
    </AuthLayout>
  )
}
