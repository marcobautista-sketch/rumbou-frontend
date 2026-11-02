// Una fórmula ya dibujada: el SVG y su tamaño en "em" (1 em = el tamaño de la letra).
export interface TexSvg {
  xml: string
  width: number
  height: number
}

export type TexRenderer = (tex: string, display: boolean) => TexSvg | null

// Comandos que podrían meter enlaces o estilos en el SVG: esas fórmulas se muestran como texto.
const UNSAFE = /\\(?:href|url|html|class|style|cssId|data)\b/

let renderer: TexRenderer | null = null
let loading: Promise<TexRenderer> | null = null
const cache = new Map<string, TexSvg | null>()

// react-native-svg no entiende las unidades "ex" de MathJax ni los atributos data-*: se quitan
// y el tamaño sale del viewBox, que MathJax mide en milésimas de em.
function toTexSvg(raw: string): TexSvg | null {
  const box = raw.match(/viewBox="([-\d.]+) ([-\d.]+) ([\d.]+) ([\d.]+)"/)
  if (!box) return null
  const xml = raw
    .replace(
      /^<svg([^>]*)>/,
      (_, attributes: string) =>
        `<svg${attributes.replace(/\s(?:width|height|style)="[^"]*"/g, '')}>`,
    )
    .replace(/\sdata-[\w-]+="[^"]*"/g, '')
  return { xml, width: Number(box[3]) / 1000, height: Number(box[4]) / 1000 }
}

export function currentTexRenderer() {
  return renderer
}

// Carga MathJax una sola vez (recién cuando aparece la primera fórmula) y guarda cada
// fórmula ya dibujada: una revisión de simulacro repite muchas.
export function loadTexRenderer() {
  loading ??= import('./mathjax').then(({ texToSvg }) => {
    renderer = (tex, display) => {
      const key = `${display ? 'D' : 'I'}${tex}`
      if (!cache.has(key)) {
        let svg: TexSvg | null = null
        if (!UNSAFE.test(tex)) {
          try {
            svg = toTexSvg(texToSvg(tex, display))
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
