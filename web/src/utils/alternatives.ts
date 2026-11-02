// Las alternativas cortas (números, fracciones, unidades) caben en fila, como en la separata.
export function areShortAlternatives(alternatives: string[]) {
  return alternatives.every((alternative) => alternative.length <= 14)
}

// El texto con formato de la alternativa si existe; si no, el texto plano.
export function formattedAlternative(formatted: string[] | null | undefined, index: number) {
  return formatted?.length === 5 ? formatted[index] : null
}
