import type { ExamQuestion, ExamType } from '../types/exam'

export const examTypeLabels: Record<ExamType, string> = {
  DIAGNOSTICO: 'Simulacro diagnóstico',
  POR_TEMA: 'Simulacro por tema',
  COMPLETO: 'Simulacro completo',
}

export interface TopicMistakes {
  temaId: number
  tema: string
  incorrect: number
  blank: number
}

export function summarizeExam(questions: ExamQuestion[]) {
  const mistakesByTopic = new Map<number, TopicMistakes>()
  let correct = 0

  for (const question of questions) {
    if (question.esCorrecta) {
      correct += 1
      continue
    }
    const topic = mistakesByTopic.get(question.temaId) ?? {
      temaId: question.temaId,
      tema: question.tema,
      incorrect: 0,
      blank: 0,
    }
    if (question.alternativaMarcada === null) topic.blank += 1
    else topic.incorrect += 1
    mistakesByTopic.set(question.temaId, topic)
  }

  const weakTopics = [...mistakesByTopic.values()].sort(
    (a, b) => b.incorrect + b.blank - (a.incorrect + a.blank),
  )
  const blank = weakTopics.reduce((sum, topic) => sum + topic.blank, 0)

  return { correct, blank, incorrect: questions.length - correct - blank, weakTopics }
}

// Solo un simulacro completo (o el diagnóstico, que también lo es) proyecta un puntaje que se
// puede comparar con el último ingresante; el de un simulacro por tema extrapola un solo tema.
export function fullExamHistory<T extends { tipo: ExamType }>(entries: T[]) {
  return entries.filter((entry) => entry.tipo !== 'POR_TEMA')
}

export interface TopicResult {
  temaId: number
  tema: string
  correct: number
  incorrect: number
  blank: number
  total: number
}

// Aciertos de cada tema del simulacro, en el orden en que aparecen en el examen.
export function topicResults(questions: ExamQuestion[]) {
  const byTopic = new Map<number, TopicResult>()
  for (const question of questions) {
    const topic = byTopic.get(question.temaId) ?? {
      temaId: question.temaId,
      tema: question.tema,
      correct: 0,
      incorrect: 0,
      blank: 0,
      total: 0,
    }
    topic.total += 1
    if (question.esCorrecta) topic.correct += 1
    else if (question.alternativaMarcada === null) topic.blank += 1
    else topic.incorrect += 1
    byTopic.set(question.temaId, topic)
  }
  return [...byTopic.values()]
}
