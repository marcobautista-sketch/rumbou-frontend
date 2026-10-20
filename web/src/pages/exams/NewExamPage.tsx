import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { generatePath, useNavigate } from 'react-router'
import { z } from 'zod'
import { areaService } from '../../api/areaService'
import { examService } from '../../api/examService'
import { Button } from '../../components/ui/Button'
import { SelectField } from '../../components/ui/SelectField'
import { useFetch } from '../../hooks/useFetch'
import { paths } from '../../routes/paths'
import type { ExamType } from '../../types/exam'
import { notify } from '../../utils/notify'

const examTypes: { value: ExamType; title: string; description: string }[] = [
  {
    value: 'POR_TEMA',
    title: 'Por tema',
    description: 'Practica un solo tema con las preguntas que trae el examen real.',
  },
  {
    value: 'COMPLETO',
    title: 'Completo',
    description: 'El examen entero, con el puntaje y la penalidad de tu universidad.',
  },
  {
    value: 'DIAGNOSTICO',
    title: 'Diagnóstico',
    description: 'Un examen completo para medir tu punto de partida.',
  },
]

const newExamSchema = z
  .object({
    areaId: z.string().min(1, 'Elige tu universidad y área'),
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
  const fetchAreas = useCallback((signal: AbortSignal) => areaService.list(signal), [])
  const areas = useFetch(fetchAreas)
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<NewExamForm>({
    resolver: zodResolver(newExamSchema),
    mode: 'onTouched',
    defaultValues: { areaId: '', tipo: 'POR_TEMA', temaId: '' },
  })
  const [areaId, tipo] = useWatch({ control, name: ['areaId', 'tipo'] })
  const fetchTopics = useCallback(
    (signal: AbortSignal) =>
      areaId ? areaService.listTopics(Number(areaId), signal) : Promise.resolve([]),
    [areaId],
  )
  const topics = useFetch(fetchTopics)

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
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-10">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">Nuevo simulacro</h1>
        <p className="text-ink-muted">
          Elige qué examen quieres rendir. Si lo dejas a medias, puedes continuarlo después.
        </p>
      </header>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="space-y-6 rounded-2xl bg-surface p-6 shadow-card"
      >
        <SelectField
          label="Universidad y área"
          disabled={areas.loading}
          error={errors.areaId?.message ?? areas.error?.message}
          {...register('areaId', { onChange: () => setValue('temaId', '') })}
        >
          <option value="">{areas.loading ? 'Cargando áreas…' : 'Elige una opción'}</option>
          {areas.data?.map((area) => (
            <option key={area.id} value={area.id}>
              {area.universidad} · {area.nombre}
            </option>
          ))}
        </SelectField>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Tipo de simulacro</legend>
          <div className="grid gap-3 sm:grid-cols-3">
            {examTypes.map((type) => (
              <label
                key={type.value}
                className="cursor-pointer rounded-2xl border-2 border-line bg-surface p-4 transition hover:bg-surface-muted has-checked:border-accent has-checked:bg-accent-soft has-focus-visible:ring-2 has-focus-visible:ring-accent"
              >
                <input type="radio" value={type.value} className="sr-only" {...register('tipo')} />
                <span className="block font-medium">{type.title}</span>
                <span className="mt-1 block text-sm text-ink-muted">{type.description}</span>
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
            <option value="">
              {areaId ? 'Elige un tema' : 'Primero elige tu universidad y área'}
            </option>
            {topics.data?.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.nombre}
              </option>
            ))}
          </SelectField>
        )}

        <Button type="submit" loading={isSubmitting} className="w-full">
          Empezar simulacro
        </Button>
      </form>
    </main>
  )
}
