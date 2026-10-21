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

const functionNames = new Set('sin cos tan cot sec csc arcsin arccos arctan log ln'.split(' '))

const superscripts: Record<string, string> = Object.fromEntries(
  [...'0123456789-+=()inxyT'].map((character, index) => [character, '⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺⁼⁽⁾ⁱⁿˣʸᵀ'[index]]),
)

function toSuperscript(exponent: string) {
  const characters = [...exponent]
  return characters.every((character) => character in superscripts)
    ? characters.map((character) => superscripts[character]).join('')
    : null
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
    .replace(
      /\^(?:\{([^}]+)\}|(\([^)]+\))|(-?[0-9a-zA-Z]+))/g,
      (match, braced?: string, parenthesized?: string, plain?: string) =>
        toSuperscript(braced ?? parenthesized ?? plain ?? '') ?? match,
    )
}
