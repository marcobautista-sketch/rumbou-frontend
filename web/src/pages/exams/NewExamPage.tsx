import { zodResolver } from '@hookform/resolvers/zod'
import { ClipboardList, Info, NotebookPen, Target, type LucideIcon } from 'lucide-react'
import { useCallback, useEffect, useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { generatePath, useNavigate, useSearchParams } from 'react-router'
import { z } from 'zod'
import { areaService } from '../../api/areaService'
import { examService } from '../../api/examService'
import { goalService } from '../../api/goalService'
import { ScoringTable } from '../../components/landing/ScoringRules'
import { Page } from '../../components/layout/Page'
import { PageHeader } from '../../components/layout/PageHeader'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { SelectField } from '../../components/ui/SelectField'
import { useFetch } from '../../hooks/useFetch'
import { paths } from '../../routes/paths'
import type { ExamType } from '../../types/exam'
import { formatScore } from '../../utils/format'
import { notify } from '../../utils/notify'
import { scoringFor } from '../../utils/scoringRules'
import { areaLabel, universityShort } from '../../utils/universityLabels'

const examTypes: { value: ExamType; title: string; description: string; icon: LucideIcon }[] = [
  {
    value: 'DIAGNOSTICO',
    title: 'Diagnóstico',
    description: 'El examen completo para medir tu punto de partida en cada tema.',
    icon: Target,
  },
  {
    value: 'POR_TEMA',
    title: 'Por tema',
    description: 'Solo las preguntas de un tema, en la cantidad que trae tu examen.',
    icon: NotebookPen,
  },
  {
    value: 'COMPLETO',
    title: 'Completo',
    description: 'El examen entero, con el puntaje y la penalidad de tu universidad.',
    icon: ClipboardList,
  },
]

const examTypeValues = examTypes.map((type) => type.value)

const newExamSchema = z
  .object({
    areaId: z.string().min(1, 'Elige el examen al que postulas'),
    tipo: z.enum(['DIAGNOSTICO', 'POR_TEMA', 'COMPLETO']),
    temaId: z.string(),
  })
  .refine((form) => form.tipo !== 'POR_TEMA' || form.temaId !== '', {
    error: 'Elige el tema que quieres practicar',
    path: ['temaId'],
  })

type NewExamForm = z.infer<typeof newExamSchema>

export default function NewExamPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const requestedType = searchParams.get('tipo') as ExamType | null
  const fetchAreas = useCallback((signal: AbortSignal) => areaService.list(signal), [])
  const fetchGoals = useCallback((signal: AbortSignal) => goalService.list(signal), [])
  const areas = useFetch(fetchAreas)
  const goals = useFetch(fetchGoals)
  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<NewExamForm>({
    resolver: zodResolver(newExamSchema),
    mode: 'onTouched',
    defaultValues: {
      areaId: '',
      tipo: requestedType && examTypeValues.includes(requestedType) ? requestedType : 'POR_TEMA',
      temaId: '',
    },
  })
  const [areaId, tipo, temaId] = useWatch({ control, name: ['areaId', 'tipo', 'temaId'] })

  // El examen de la carrera meta viene elegido: es el que el postulante va a rendir.
  const goalAreaId = goals.data?.[0]?.areaId
  useEffect(() => {
    if (goalAreaId && !getValues('areaId')) setValue('areaId', String(goalAreaId))
  }, [goalAreaId, getValues, setValue])

  const fetchTopics = useCallback(
    (signal: AbortSignal) =>
      areaId ? areaService.listTopics(Number(areaId), signal) : Promise.resolve([]),
    [areaId],
  )
  const topics = useFetch(fetchTopics)
  const area = useMemo(
    () => areas.data?.find((candidate) => String(candidate.id) === areaId) ?? null,
    [areas.data, areaId],
  )
  const rules = scoringFor(area?.universidad)
  const topic = topics.data?.find((candidate) => String(candidate.id) === temaId) ?? null

  const questionsLabel = (type: ExamType) => {
    if (type === 'POR_TEMA') return topic ? `${topic.cantidadPreguntas} preguntas` : 'Un tema'
    return rules ? `${rules.questions} preguntas` : 'Examen completo'
  }

  const onSubmit = async (form: NewExamForm) => {
    try {
      const examId = await examService.start({
        areaId: Number(form.areaId),
        tipo: form.tipo,
        temaId: form.tipo === 'POR_TEMA' ? Number(form.temaId) : undefined,
      })
      navigate(generatePath(paths.exam, { examId: String(examId) }))
    } catch (error) {
      notify.error(error)
    }
  }

  return (
    <Page>
      <PageHeader
        title="Nuevo simulacro"
        description="Elige el examen y el tipo de simulacro. Tus respuestas se guardan al marcarlas, así que puedes dejarlo y retomarlo después."
        breadcrumbs={[{ label: 'Simulacros', to: paths.examHistory }, { label: 'Nuevo simulacro' }]}
      />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_23rem]">
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="space-y-6 rounded-2xl bg-surface p-6 shadow-card"
        >
          <SelectField
            label="Examen"
            disabled={areas.loading}
            error={errors.areaId?.message ?? areas.error?.message}
            {...register('areaId', { onChange: () => setValue('temaId', '') })}
          >
            <option value="">{areas.loading ? 'Cargando exámenes…' : 'Elige un examen'}</option>
            {areas.data?.map((option) => (
              <option key={option.id} value={option.id}>
                {areaLabel(option.universidad, option.nombre)}
              </option>
            ))}
          </SelectField>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Tipo de simulacro</legend>
            <div className="grid gap-3 md:grid-cols-3">
              {examTypes.map(({ value, title, description, icon: Icon }) => (
                <label
                  key={value}
                  className="flex cursor-pointer flex-col gap-2 rounded-xl border-2 border-line bg-surface p-4 transition hover:bg-surface-muted has-checked:border-primary has-checked:bg-chip has-focus-visible:ring-2 has-focus-visible:ring-accent"
                >
                  <input type="radio" value={value} className="sr-only" {...register('tipo')} />
                  <span className="flex items-center gap-2 font-semibold">
                    <Icon aria-hidden className="size-5 text-primary" />
                    {title}
                  </span>
                  <span className="text-sm text-ink-muted">{description}</span>
                  <span className="mt-auto pt-1 text-xs font-semibold text-ink-muted">
                    {questionsLabel(value)}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {tipo === 'POR_TEMA' && (
            <SelectField
              label="Tema"
              disabled={!areaId || topics.loading}
              error={errors.temaId?.message ?? topics.error?.message}
              {...register('temaId')}
            >
              <option value="">{areaId ? 'Elige un tema' : 'Primero elige el examen'}</option>
              {topics.data?.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.nombre} · {option.cantidadPreguntas} preguntas
                </option>
              ))}
            </SelectField>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-5">
            <p className="text-sm text-ink-muted">
              Sin límite de tiempo: el cronómetro solo te muestra cuánto llevas.
            </p>
            <Button type="submit" loading={isSubmitting} className="w-full sm:w-auto">
              Empezar simulacro
            </Button>
          </div>
        </form>

        <Card className="space-y-4 p-5" aria-labelledby="scoring-title">
          <div className="space-y-1">
            <h2 id="scoring-title" className="flex items-center gap-2 font-bold">
              <Info aria-hidden className="size-4 text-primary" />
              Cómo se califica
            </h2>
            <p className="text-sm text-ink-muted">
              {rules
                ? `${universityShort(rules.siglas)}: ${rules.questions} preguntas y ${formatScore(rules.maxScore)} puntos en el examen completo.`
                : 'Elige un examen para ver sus reglas.'}
            </p>
          </div>
          {rules && <ScoringTable rules={rules} compact />}
          <p className="text-sm text-ink-muted">
            Las preguntas en blanco no suman ni restan. Tu puntaje proyectado lleva este puntaje a
            la escala del examen completo.
          </p>
        </Card>
      </div>
    </Page>
  )
}
