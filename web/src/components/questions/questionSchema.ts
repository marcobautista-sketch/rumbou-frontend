import { z } from 'zod'
import type { QuestionRequest } from '../../types/question'

export const ALTERNATIVES_COUNT = 5

export const questionSchema = z.object({
  areaId: z.string(),
  temaId: z.string().min(1, 'Elige el tema de la pregunta'),
  enunciado: z
    .string()
    .trim()
    .min(10, 'El enunciado debe tener al menos 10 caracteres')
    .max(2000, 'El enunciado no puede pasar de 2000 caracteres'),
  alternativas: z
    .array(z.string().trim().min(1, 'Escribe esta alternativa'))
    .length(ALTERNATIVES_COUNT),
  claveCorrecta: z.string().min(1, 'Marca cuál es la alternativa correcta'),
  explicacion: z.string().trim().max(3000, 'La explicación no puede pasar de 3000 caracteres'),
  dificultad: z.enum(['FACIL', 'MEDIA', 'DIFICIL'], { error: 'Elige la dificultad' }),
  origen: z.enum(['SEMILLA', 'IA_APROBADA']),
  aprobada: z.boolean(),
})

export type QuestionFormValues = z.infer<typeof questionSchema>

export const emptyQuestionForm: QuestionFormValues = {
  areaId: '',
  temaId: '',
  enunciado: '',
  alternativas: Array.from({ length: ALTERNATIVES_COUNT }, () => ''),
  claveCorrecta: '',
  explicacion: '',
  dificultad: 'MEDIA',
  origen: 'SEMILLA',
  aprobada: true,
}

export function toQuestionRequest(form: QuestionFormValues): QuestionRequest {
  return {
    temaId: Number(form.temaId),
    enunciado: form.enunciado,
    alternativas: form.alternativas,
    claveCorrecta: Number(form.claveCorrecta),
    explicacion: form.explicacion || null,
    dificultad: form.dificultad,
    origen: form.origen,
    aprobada: form.aprobada,
  }
}
