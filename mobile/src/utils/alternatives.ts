// El texto con formato de la alternativa si existe; si no, null para usar el texto plano.
export function formattedAlternative(formatted: string[] | null | undefined, index: number) {
  return formatted?.length === 5 ? formatted[index] : null
}
