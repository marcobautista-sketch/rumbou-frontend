// Cómo se acomodan las alternativas, como en la separata: en fila las muy cortas (números,
// fracciones, unidades), en columnas las palabras sueltas y una debajo de otra las frases.
// Los cortes se midieron con la columna de la pregunta al lado de la hoja de respuestas.
export function alternativesLayout(alternatives: string[]) {
  const longest = Math.max(...alternatives.map((alternative) => alternative.length))
  if (longest <= 6) return 'grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5'
  if (longest <= 18) return 'grid gap-2 sm:grid-cols-2 lg:grid-cols-3'
  return 'space-y-2'
}

// El texto con formato de la alternativa si existe; si no, el texto plano.
export function formattedAlternative(formatted: string[] | null | undefined, index: number) {
  return formatted?.length === 5 ? formatted[index] : null
}
