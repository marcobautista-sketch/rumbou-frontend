export interface MathPart {
  type: 'text' | 'inline' | 'display'
  value: string
}

// Divide un texto en trozos de texto normal, fórmula en línea ($...$) y fórmula en su propio
// renglón ($$...$$). "\$" dentro de una fórmula es un signo de dólar literal.
export function splitMath(text: string): MathPart[] {
  const parts: MathPart[] = []
  const pattern = /\$\$([\s\S]+?)\$\$|\$((?:\\\$|[^$])+?)\$/g
  let last = 0
  for (const match of text.matchAll(pattern)) {
    if (match.index > last) parts.push({ type: 'text', value: text.slice(last, match.index) })
    parts.push(
      match[1] !== undefined
        ? { type: 'display', value: match[1].trim() }
        : { type: 'inline', value: match[2].trim() },
    )
    last = match.index + match[0].length
  }
  if (last < text.length) parts.push({ type: 'text', value: text.slice(last) })
  return parts
}
