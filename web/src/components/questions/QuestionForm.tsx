import { zodResolver } from '@hookform/resolvers/zod'
import { Info } from 'lucide-react'
import { useForm, useWatch } from 'react-hook-form'
import { useAreaTopics } from '../../hooks/useAreaTopics'
import { ALTERNATIVES_COUNT, questionSchema, type QuestionFormValues } from './questionSchema'
import type { Topic } from '../../types/exam'
import { alternativeLetter } from '../../utils/format'
import { difficulties, difficultyLabels, originLabels, origins } from '../../utils/questionLabels'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { fieldStyles } from '../ui/fieldStyles'
import { SelectField } from '../ui/SelectField'
import { TextAreaField } from '../ui/TextAreaField'

interface QuestionFormProps {
  defaultValues: QuestionFormValues
  currentTopic?: Topic
  submitLabel: string
  notice?: string
  onSubmit: (values: QuestionFormValues) => Promise<void>
  onCancel: () => void
}

export function QuestionForm({
  defaultValues,
  currentTopic,
  submitLabel,
  notice,
  onSubmit,
  onCancel,
}: QuestionFormProps) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    mode: 'onTouched',
    defaultValues,
  })
  const [areaId, statement, correctKey] = useWatch({
    control,
    name: ['areaId', 'enunciado', 'claveCorrecta'],
  })
  const { areas, topics } = useAreaTopics(areaId ? Number(areaId) : null)

  const topicOptions = areaId ? (topics.data ?? []) : currentTopic ? [currentTopic] : []

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      {notice && (
        <div className="flex gap-3 rounded-2xl border border-warning/30 bg-warning/10 p-4 text-warning">
          <Info aria-hidden className="mt-0.5 size-5 shrink-0" />
          <p>{notice}</p>
        </div>
      )}

      <Card className="space-y-5">
        <h2 className="text-lg font-semibold">Tema y dificultad</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Universidad y área"
            disabled={areas.loading}
            error={areas.error?.message}
            {...register('areaId', {
              onChange: () => setValue('temaId', '', { shouldValidate: false }),
            })}
          >
            <option value="">
              {currentTopic ? 'Mantener el tema actual' : 'Elige para ver sus temas'}
            </option>
            {areas.data?.map((area) => (
              <option key={area.id} value={area.id}>
                {area.universidad} · {area.nombre}
              </option>
            ))}
          </SelectField>

          <SelectField
            label="Tema"
            disabled={topicOptions.length === 0 || topics.loading}
            error={errors.temaId?.message ?? topics.error?.message}
            {...register('temaId')}
          >
            <option value="">
              {topics.loading
                ? 'Cargando temas…'
                : areaId
                  ? 'Elige un tema'
                  : 'Primero elige un área'}
            </option>
            {topicOptions.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.nombre}
              </option>
            ))}
          </SelectField>

          <SelectField
            label="Dificultad"
            error={errors.dificultad?.message}
            {...register('dificultad')}
          >
            {difficulties.map((difficulty) => (
              <option key={difficulty} value={difficulty}>
                {difficultyLabels[difficulty]}
              </option>
            ))}
          </SelectField>

          <SelectField label="Origen" {...register('origen')}>
            {origins.map((origin) => (
              <option key={origin} value={origin}>
                {originLabels[origin]}
              </option>
            ))}
          </SelectField>
        </div>
      </Card>

      <Card className="space-y-5">
        <h2 className="text-lg font-semibold">Pregunta</h2>
        <TextAreaField
          label="Enunciado"
          rows={5}
          placeholder="Ej.: Si 3x + 5 = 20, ¿cuál es el valor de x?"
          error={errors.enunciado?.message}
          hint={`${statement.trim().length}/2000 caracteres`}
          {...register('enunciado')}
        />

        <fieldset className="space-y-3">
          <legend className="text-sm font-medium">Alternativas</legend>
          <p className="text-sm text-ink-muted">
            Escribe las 5 alternativas y marca con el círculo la correcta.
          </p>
          {Array.from({ length: ALTERNATIVES_COUNT }, (_, index) => {
            const letter = alternativeLetter(index)
            const fieldError = errors.alternativas?.[index]?.message
            const isCorrect = correctKey === String(index)
            return (
              <div key={index} className="space-y-1">
                <div
                  className={`flex items-center gap-3 rounded-xl border p-2 pl-3 transition ${
                    isCorrect ? 'border-success bg-success/10' : 'border-transparent'
                  }`}
                >
                  <input
                    type="radio"
                    value={String(index)}
                    aria-label={`Marcar la alternativa ${letter} como correcta`}
                    className="size-4 shrink-0 accent-success"
                    {...register('claveCorrecta')}
                  />
                  <span className="w-5 font-semibold">{letter})</span>
                  <input
                    type="text"
                    aria-label={`Alternativa ${letter}`}
                    aria-invalid={fieldError ? true : undefined}
                    placeholder={`Alternativa ${letter}`}
                    className={fieldStyles(Boolean(fieldError))}
                    {...register(`alternativas.${index}`)}
                  />
                </div>
                {fieldError && (
                  <p role="alert" className="pl-14 text-sm text-danger">
                    {fieldError}
                  </p>
                )}
              </div>
            )
          })}
          {errors.claveCorrecta && (
            <p role="alert" className="text-sm text-danger">
              {errors.claveCorrecta.message}
            </p>
          )}
        </fieldset>

        <TextAreaField
          label="Explicación (opcional)"
          rows={4}
          placeholder="Explica cómo se llega a la respuesta correcta."
          hint="Se muestra al postulante cuando revisa su simulacro."
          error={errors.explicacion?.message}
          {...register('explicacion')}
        />

        <label className="flex cursor-pointer items-center gap-3">
          <input type="checkbox" className="size-4 accent-primary" {...register('aprobada')} />
          <span>
            <span className="font-medium">Aprobada</span>
            <span className="block text-sm text-ink-muted">
              Solo las preguntas aprobadas aparecen en los simulacros.
            </span>
          </span>
        </label>
      </Card>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
