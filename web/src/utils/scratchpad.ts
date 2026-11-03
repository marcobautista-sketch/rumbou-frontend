import type { Stroke } from '../types/scratchpad'

// La pizarra de cada pregunta se guarda en este navegador mientras se resuelve: así sigue ahí
// al volver a la pregunta o al recargar la página. Es solo del postulante: no se envía a nadie.
const PREFIX = 'rumbou.pizarra.'

const keyOf = (scope: string, questionId: number) => `${PREFIX}${scope}.${questionId}`

export function readScratch(scope: string, questionId: number): Stroke[] {
  try {
    const saved = localStorage.getItem(keyOf(scope, questionId))
    return saved ? (JSON.parse(saved) as Stroke[]) : []
  } catch {
    return []
  }
}

export function saveScratch(scope: string, questionId: number, strokes: Stroke[]) {
  try {
    if (strokes.length > 0) localStorage.setItem(keyOf(scope, questionId), JSON.stringify(strokes))
    else localStorage.removeItem(keyOf(scope, questionId))
  } catch {
    // Sin espacio o sin permiso: la pizarra sigue funcionando, solo que no se recuerda.
  }
}

// Al terminar el simulacro o responder el desafío, sus pizarras ya no sirven y se borran.
export function clearScratch(scope: string) {
  try {
    Object.keys(localStorage)
      .filter((key) => key.startsWith(`${PREFIX}${scope}.`))
      .forEach((key) => localStorage.removeItem(key))
  } catch {
    // Nada que limpiar si el navegador no deja leer el almacenamiento.
  }
}
