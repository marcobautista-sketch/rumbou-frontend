export interface ScoringBlock {
  name: string
  correct: string
  wrong: string
  points: string
}

export interface UniversityScoring {
  siglas: string
  name: string
  questions: number
  maxScore: number
  blocks: ScoringBlock[]
}

// Reglas de los prospectos de admisión, las mismas que usa el backend para calificar
// (seed/esquemas.csv): aquí solo se muestran. Las preguntas en blanco no suman ni restan.
export const scoringRules: UniversityScoring[] = [
  {
    siglas: 'UNI',
    name: 'Universidad Nacional de Ingeniería',
    questions: 180,
    maxScore: 1800,
    blocks: [
      { name: 'Aptitud Académica y Humanidades', correct: '+6', wrong: '−1.2', points: '600' },
      { name: 'Matemática', correct: '+15', wrong: '−3', points: '600' },
      { name: 'Física y Química', correct: '+15', wrong: '−3', points: '600' },
    ],
  },
  {
    siglas: 'UNMSM',
    name: 'Universidad Nacional Mayor de San Marcos',
    questions: 100,
    maxScore: 2000,
    blocks: [
      { name: 'Actitudinal', correct: '+20', wrong: '0', points: '200' },
      { name: 'Habilidades', correct: '+20', wrong: '−1.125', points: '400' },
      { name: 'Conocimientos', correct: '+20', wrong: '−1.125', points: '1,400' },
    ],
  },
]

export function scoringFor(siglas: string | null | undefined) {
  return scoringRules.find((rules) => rules.siglas === siglas) ?? null
}
