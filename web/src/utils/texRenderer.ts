export type TexRenderer = (tex: string, display: boolean) => string | null

// Comandos que podrían meter enlaces o estilos en el SVG: esas fórmulas se muestran como texto.
const UNSAFE = /\\(?:href|url|html|class|style|cssId|data)\b/

let renderer: TexRenderer | null = null
let loading: Promise<TexRenderer> | null = null
const cache = new Map<string, string | null>()

export function currentTexRenderer() {
  return renderer
}

// Carga MathJax una sola vez y guarda cada fórmula ya dibujada: una revisión repite muchas.
export function loadTexRenderer() {
  loading ??= import('./mathjax').then(({ texToSvg }) => {
    renderer = (tex, display) => {
      const key = `${display ? 'D' : 'I'}${tex}`
      if (!cache.has(key)) {
        let svg: string | null = null
        if (!UNSAFE.test(tex)) {
          try {
            svg = texToSvg(tex, display)
          } catch {
            svg = null
          }
        }
        cache.set(key, svg)
      }
      return cache.get(key) ?? null
    }
    return renderer
  })
  return loading
}
