import type { ExamQuestion } from '../types/exam'

export interface TopicMistakes {
  temaId: number
  tema: string
  incorrect: number
  blank: number
}

// Temas con más preguntas falladas o en blanco, del más débil al menos débil.
export function weakTopics(questions: ExamQuestion[]) {
  const byTopic = new Map<number, TopicMistakes>()
  for (const question of questions) {
    if (question.esCorrecta) continue
    const topic = byTopic.get(question.temaId) ?? {
      temaId: question.temaId,
      tema: question.tema,
      incorrect: 0,
      blank: 0,
    }
    if (question.alternativaMarcada === null) topic.blank += 1
    else topic.incorrect += 1
    byTopic.set(question.temaId, topic)
  }
  return [...byTopic.values()].sort((a, b) => b.incorrect + b.blank - (a.incorrect + a.blank))
}
