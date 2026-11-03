// Cómo la llaman los postulantes: "San Marcos" se entiende mejor que "UNMSM". Igual que en la web.
const shortNames: Record<string, string> = {
  UNI: 'UNI',
  UNMSM: 'San Marcos',
}

// Puntaje máximo del examen completo de cada universidad (seed/universidades.csv).
const maxScores: Record<string, number> = {
  UNI: 1800,
  UNMSM: 2000,
}

export function universityShort(siglas: string) {
  return shortNames[siglas] ?? siglas
}

export function universityMaxScore(siglas: string | null | undefined) {
  return siglas ? (maxScores[siglas] ?? null) : null
}

// La UNI tiene una sola área ("General"), así que basta con su nombre; en San Marcos el área
// sí distingue el examen (Ciencias Básicas o Ingenierías).
export function areaLabel(siglas: string | null | undefined, areaName: string | null | undefined) {
  if (!siglas) return areaName ?? ''
  if (!areaName || areaName.toLowerCase() === 'general') return universityShort(siglas)
  return `${universityShort(siglas)} · ${areaName}`
}
