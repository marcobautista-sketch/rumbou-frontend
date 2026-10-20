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
