const symbols: Record<string, string> = {
  alpha: 'α',
  angle: '∠',
  beta: 'β',
  cdot: '·',
  Delta: 'Δ',
  ge: '≥',
  geq: '≥',
  in: '∈',
  infty: '∞',
  le: '≤',
  leq: '≤',
  neq: '≠',
  pi: 'π',
  pm: '±',
  theta: 'θ',
  times: '×',
}

const functionNames = new Set([
  'sin',
  'cos',
  'tan',
  'cot',
  'sec',
  'csc',
  'arcsin',
  'arccos',
  'arctan',
  'log',
  'ln',
])

const superscripts: Record<string, string> = {
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹',
  '-': '⁻',
  n: 'ⁿ',
}

export function formatMath(text: string) {
  return text
    .replace(/\\?text\{([^}]*)\}/g, '$1')
    .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '($1)/($2)')
    .replace(/\\sqrt\{([^}]*)\}/g, (_, radicand: string) =>
      /^\w+$/.test(radicand) ? `√${radicand}` : `√(${radicand})`,
    )
    .replace(
      /\\([a-zA-Z]+)/g,
      (command, name: string) => symbols[name] ?? (functionNames.has(name) ? name : command),
    )
    .replace(/\^\{?(-?[0-9n]+)\}?/g, (_, exponent: string) =>
      [...exponent].map((character) => superscripts[character] ?? character).join(''),
    )
}
