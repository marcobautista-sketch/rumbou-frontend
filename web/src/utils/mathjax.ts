// MathJax convierte LaTeX en un dibujo SVG que no necesita fuentes. Este archivo se carga
// aparte (import dinámico desde texRenderer.ts) porque pesa: solo lo baja quien ve fórmulas.
import { liteAdaptor } from 'mathjax-full/js/adaptors/liteAdaptor.js'
import { RegisterHTMLHandler } from 'mathjax-full/js/handlers/html.js'
import 'mathjax-full/js/input/tex/ams/AmsConfiguration.js'
import 'mathjax-full/js/input/tex/base/BaseConfiguration.js'
import 'mathjax-full/js/input/tex/cancel/CancelConfiguration.js'
import 'mathjax-full/js/input/tex/mhchem/MhchemConfiguration.js'
import 'mathjax-full/js/input/tex/noundefined/NoUndefinedConfiguration.js'
import { TeX } from 'mathjax-full/js/input/tex.js'
import { mathjax } from 'mathjax-full/js/mathjax.js'
import { SVG } from 'mathjax-full/js/output/svg.js'

const adaptor = liteAdaptor()
RegisterHTMLHandler(adaptor)

const document = mathjax.document('', {
  InputJax: new TeX({ packages: ['base', 'ams', 'noundefined', 'mhchem', 'cancel'] }),
  OutputJax: new SVG({ fontCache: 'none' }),
})

export function texToSvg(tex: string, display: boolean) {
  return adaptor.innerHTML(document.convert(tex, { display }))
}
