export const universityNames: Record<string, string> = {
  UNI: 'Universidad Nacional de Ingeniería (UNI)',
  UNMSM: 'Universidad Nacional Mayor de San Marcos (UNMSM)',
}

// Cómo la llaman los postulantes: "San Marcos" se entiende mejor que "UNMSM".
const shortNames: Record<string, string> = {
  UNI: 'UNI',
  UNMSM: 'San Marcos',
}

export function universityShort(siglas: string) {
  return shortNames[siglas] ?? siglas
}

// La UNI tiene una sola área ("General"), así que basta con su nombre; en San Marcos el área
// sí distingue el examen (Ciencias Básicas o Ingenierías).
export function areaLabel(siglas: string, areaName: string | null | undefined) {
  if (!areaName || areaName.toLowerCase() === 'general') return universityShort(siglas)
  return `${universityShort(siglas)} · ${areaName}`
}
