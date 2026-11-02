// Convierte la descripción de una figura (coordenadas cartesianas, eje y hacia arriba) en formas
// listas para dibujar en SVG. La web y la app usan este mismo archivo, así ambas dibujan igual.

export interface FigureView {
  xmin: number
  xmax: number
  ymin: number
  ymax: number
}

export interface FigurePoint {
  nombre: string
  x: number
  y: number
}

type LineStyle = 'normal' | 'discontinuo' | 'destacado'
type LabelStyle = 'variable' | 'normal' | 'pequeno' | 'destacado'

export type FigureElement =
  | { tipo: 'poligono'; puntos: string[] }
  | { tipo: 'segmento' | 'flecha'; desde: string; hasta: string; estilo?: LineStyle }
  | { tipo: 'circulo'; centro: string; radio: number }
  | { tipo: 'arco'; centro: string; desde: string; hasta: string; radio: number; texto?: string }
  | { tipo: 'angulo_recto'; vertice: string; a: string; b: string }
  | { tipo: 'punto'; en: string; abierto?: boolean }
  | { tipo: 'etiqueta'; x: number; y: number; texto: string; estilo?: LabelStyle }
  | { tipo: 'ejes'; xmin: number; xmax: number; ymin: number; ymax: number; marcas?: boolean }
  | { tipo: 'curva'; coordenadas: number[] }
  | { tipo: 'rectangulo'; desde: string; hasta: string; texto?: string }
  | { tipo: 'suelo'; y: number; xmin: number; xmax: number }

export interface Figure {
  descripcion: string
  vista: FigureView
  puntos: FigurePoint[]
  elementos: FigureElement[]
}

// "ink" línea normal, "mark" lo destacado, "thin" líneas finas (ejes, marcas), "dash" discontinua.
export type StrokeTone = 'ink' | 'mark' | 'thin' | 'dash'
export type TextTone = 'variable' | 'normal' | 'small' | 'mark'

export type Shape =
  | { kind: 'area'; points: string }
  | { kind: 'line'; x1: number; y1: number; x2: number; y2: number; tone: StrokeTone }
  | { kind: 'path'; d: string; tone: StrokeTone }
  | { kind: 'head'; points: string; tone: 'ink' | 'mark' }
  | { kind: 'dot'; cx: number; cy: number; r: number; hollow: boolean }
  | { kind: 'text'; x: number; y: number; text: string; tone: TextTone; size: number }

export interface FigureLayout {
  width: number
  height: number
  shapes: Shape[]
  problems: string[]
}

export const TEXT_SIZES: Record<TextTone, number> = {
  variable: 17,
  normal: 14,
  small: 12,
  mark: 16,
}
const MAX_WIDTH = 330
const MAX_HEIGHT = 270
const PAD = 6

const round = (n: number) => Math.round(n * 10) / 10

export function layoutFigure(figure: Figure): FigureLayout {
  const problems: string[] = []
  const { xmin, xmax, ymin, ymax } = figure.vista
  const spanX = xmax - xmin
  const spanY = ymax - ymin
  if (!(spanX > 0 && spanY > 0)) {
    return { width: 0, height: 0, shapes: [], problems: ['vista vacía o invertida'] }
  }
  // Una sola escala para x e y: las figuras no se deforman.
  const scale = Math.min(MAX_WIDTH / spanX, MAX_HEIGHT / spanY, 48)
  const width = round(spanX * scale + PAD * 2)
  const height = round(spanY * scale + PAD * 2)
  const X = (x: number) => round((x - xmin) * scale + PAD)
  const Y = (y: number) => round((ymax - y) * scale + PAD)

  const named = new Map(figure.puntos.map((p) => [p.nombre, p]))
  const point = (name: string) => {
    const found = named.get(name)
    if (!found) problems.push(`no existe el punto "${name}"`)
    return found ?? { nombre: name, x: xmin, y: ymin }
  }
  for (const p of figure.puntos) {
    if (!Number.isFinite(p.x) || !Number.isFinite(p.y))
      problems.push(`coordenadas inválidas en ${p.nombre}`)
    else if (p.x < xmin || p.x > xmax || p.y < ymin || p.y > ymax)
      problems.push(`el punto ${p.nombre} queda fuera de la vista`)
  }

  const shapes: Shape[] = []
  const texts: Extract<Shape, { kind: 'text' }>[] = []
  const tone = (style?: LineStyle): StrokeTone =>
    style === 'destacado' ? 'mark' : style === 'discontinuo' ? 'dash' : 'ink'

  const arrowHead = (x1: number, y1: number, x2: number, y2: number, headTone: 'ink' | 'mark') => {
    const length = Math.hypot(x2 - x1, y2 - y1) || 1
    const ux = (x2 - x1) / length
    const uy = (y2 - y1) / length
    const bx = x2 - ux * 11
    const by = y2 - uy * 11
    shapes.push({
      kind: 'head',
      tone: headTone,
      points: `${x2},${y2} ${round(bx - uy * 5)},${round(by + ux * 5)} ${round(bx + uy * 5)},${round(by - ux * 5)}`,
    })
  }
  const textShape = (x: number, y: number, text: string, textTone: TextTone) => {
    const size = TEXT_SIZES[textTone]
    // El centro vertical se aproxima bajando el renglón un tercio del tamaño de letra.
    return {
      kind: 'text' as const,
      x: round(x),
      y: round(y + size * 0.35),
      text,
      tone: textTone,
      size,
    }
  }
  const addText = (x: number, y: number, text: string, textTone: TextTone) => {
    const shape = textShape(x, y, text, textTone)
    texts.push(shape)
    shapes.push(shape)
  }
  // Rectángulo aproximado de un texto, para detectar etiquetas encimadas o fuera del dibujo.
  const box = (t: (typeof texts)[number]) => {
    const w = [...t.text].length * t.size * 0.55
    return { x1: t.x - w / 2, x2: t.x + w / 2, y1: t.y - t.size * 0.8, y2: t.y + t.size * 0.1 }
  }
  const overlaps = (a: ReturnType<typeof box>, b: ReturnType<typeof box>) =>
    Math.min(a.x2, b.x2) - Math.max(a.x1, b.x1) > 2 &&
    Math.min(a.y2, b.y2) - Math.max(a.y1, b.y1) > 2
  const outside = (a: ReturnType<typeof box>) =>
    a.x1 < -2 || a.x2 > width + 2 || a.y1 < -2 || a.y2 > height + 2
  // Las letras x e y de los ejes se ponen al final y solo si no chocan con etiquetas propias.
  const axisLabels: (typeof texts)[number][] = []

  for (const element of figure.elementos) {
    switch (element.tipo) {
      case 'poligono': {
        const pts = element.puntos.map(point)
        shapes.push({ kind: 'area', points: pts.map((p) => `${X(p.x)},${Y(p.y)}`).join(' ') })
        break
      }
      case 'segmento':
      case 'flecha': {
        const a = point(element.desde)
        const b = point(element.hasta)
        const lineTone = tone(element.estilo)
        shapes.push({
          kind: 'line',
          x1: X(a.x),
          y1: Y(a.y),
          x2: X(b.x),
          y2: Y(b.y),
          tone: lineTone,
        })
        if (element.tipo === 'flecha')
          arrowHead(X(a.x), Y(a.y), X(b.x), Y(b.y), lineTone === 'mark' ? 'mark' : 'ink')
        break
      }
      case 'circulo': {
        const c = point(element.centro)
        const r = round(element.radio * scale)
        shapes.push({
          kind: 'path',
          tone: 'ink',
          d: `M${X(c.x) - r},${Y(c.y)} a${r},${r} 0 1,0 ${r * 2},0 a${r},${r} 0 1,0 ${-r * 2},0`,
        })
        break
      }
      case 'arco': {
        const c = point(element.centro)
        const from = point(element.desde)
        const to = point(element.hasta)
        let a1 = Math.atan2(from.y - c.y, from.x - c.x)
        let a2 = Math.atan2(to.y - c.y, to.x - c.x)
        while (a2 <= a1) a2 += Math.PI * 2
        // Una marca de ángulo siempre es el ángulo menor entre los dos lados.
        if (a2 - a1 > Math.PI) [a1, a2] = [a2, a1 + Math.PI * 2]
        const r = Math.min(Math.max(element.radio * scale, 14), 42)
        const p1 = [X(c.x) + r * Math.cos(a1), Y(c.y) - r * Math.sin(a1)]
        const p2 = [X(c.x) + r * Math.cos(a2), Y(c.y) - r * Math.sin(a2)]
        shapes.push({
          kind: 'path',
          tone: 'thin',
          d: `M${round(p1[0])},${round(p1[1])} A${round(r)},${round(r)} 0 0,0 ${round(p2[0])},${round(p2[1])}`,
        })
        if (element.texto) {
          const mid = (a1 + a2) / 2
          addText(
            X(c.x) + (r + 12) * Math.cos(mid),
            Y(c.y) - (r + 12) * Math.sin(mid),
            element.texto,
            'mark',
          )
        }
        break
      }
      case 'angulo_recto': {
        const v = point(element.vertice)
        const a = point(element.a)
        const b = point(element.b)
        const unit = (p: FigurePoint) => {
          const dx = X(p.x) - X(v.x)
          const dy = Y(p.y) - Y(v.y)
          const d = Math.hypot(dx, dy) || 1
          return [dx / d, dy / d]
        }
        const [ux, uy] = unit(a)
        const [wx, wy] = unit(b)
        const k = 11
        const vx = X(v.x)
        const vy = Y(v.y)
        shapes.push({
          kind: 'path',
          tone: 'thin',
          d: `M${round(vx + ux * k)},${round(vy + uy * k)} L${round(vx + (ux + wx) * k)},${round(vy + (uy + wy) * k)} L${round(vx + wx * k)},${round(vy + wy * k)}`,
        })
        break
      }
      case 'punto': {
        const p = point(element.en)
        shapes.push({ kind: 'dot', cx: X(p.x), cy: Y(p.y), r: 4, hollow: Boolean(element.abierto) })
        break
      }
      case 'etiqueta': {
        const textTone: TextTone =
          element.estilo === 'variable'
            ? 'variable'
            : element.estilo === 'pequeno'
              ? 'small'
              : element.estilo === 'destacado'
                ? 'mark'
                : 'normal'
        if (element.x < xmin || element.x > xmax || element.y < ymin || element.y > ymax) {
          problems.push(`la etiqueta "${element.texto}" queda fuera de la vista`)
        }
        addText(X(element.x), Y(element.y), element.texto, textTone)
        break
      }
      case 'ejes': {
        const x0 = X(Math.min(Math.max(0, element.xmin), element.xmax))
        const y0 = Y(Math.min(Math.max(0, element.ymin), element.ymax))
        shapes.push({
          kind: 'line',
          tone: 'thin',
          x1: X(element.xmin),
          y1: y0,
          x2: X(element.xmax),
          y2: y0,
        })
        arrowHead(X(element.xmin), y0, X(element.xmax), y0, 'ink')
        shapes.push({
          kind: 'line',
          tone: 'thin',
          x1: x0,
          y1: Y(element.ymin),
          x2: x0,
          y2: Y(element.ymax),
        })
        arrowHead(x0, Y(element.ymin), x0, Y(element.ymax), 'ink')
        if (element.marcas) {
          for (let t = Math.ceil(element.xmin); t < element.xmax - 0.3; t++) {
            if (t !== 0)
              shapes.push({
                kind: 'line',
                tone: 'thin',
                x1: X(t),
                y1: y0 - 4,
                x2: X(t),
                y2: y0 + 4,
              })
          }
          for (let t = Math.ceil(element.ymin); t < element.ymax - 0.3; t++) {
            if (t !== 0)
              shapes.push({
                kind: 'line',
                tone: 'thin',
                x1: x0 - 4,
                y1: Y(t),
                x2: x0 + 4,
                y2: Y(t),
              })
          }
        }
        // Si la figura ya trae sus propias etiquetas "x" o "y", no se repiten.
        const labelled = (name: string) =>
          figure.elementos.some((e) => e.tipo === 'etiqueta' && e.texto.trim() === name)
        if (!labelled('x'))
          axisLabels.push(textShape(X(element.xmax) - 4, y0 + 14, 'x', 'variable'))
        if (!labelled('y')) {
          const side = x0 - 13 < 8 ? 13 : -13
          axisLabels.push(textShape(x0 + side, Y(element.ymax) + 6, 'y', 'variable'))
        }
        break
      }
      case 'curva': {
        const c = element.coordenadas
        if (c.length < 4 || c.length % 2) {
          problems.push('curva con coordenadas incompletas')
          break
        }
        let d = ''
        let drawing = false
        for (let i = 0; i < c.length; i += 2) {
          const inside = c[i] >= xmin && c[i] <= xmax && c[i + 1] >= ymin && c[i + 1] <= ymax
          // Los tramos que salen de la vista se cortan en vez de deformar el dibujo.
          if (inside) {
            d += `${drawing ? 'L' : 'M'}${X(c[i])},${Y(c[i + 1])} `
            drawing = true
          } else drawing = false
        }
        if (d) shapes.push({ kind: 'path', tone: 'ink', d: d.trim() })
        break
      }
      case 'rectangulo': {
        const a = point(element.desde)
        const b = point(element.hasta)
        const [x1, x2] = [X(Math.min(a.x, b.x)), X(Math.max(a.x, b.x))]
        const [y1, y2] = [Y(Math.max(a.y, b.y)), Y(Math.min(a.y, b.y))]
        shapes.push({ kind: 'area', points: `${x1},${y1} ${x2},${y1} ${x2},${y2} ${x1},${y2}` })
        if (element.texto) addText((x1 + x2) / 2, (y1 + y2) / 2, element.texto, 'normal')
        break
      }
      case 'suelo': {
        const y = Y(element.y)
        shapes.push({
          kind: 'line',
          tone: 'ink',
          x1: X(element.xmin),
          y1: y,
          x2: X(element.xmax),
          y2: y,
        })
        for (let x = X(element.xmin) + 8; x < X(element.xmax); x += 10) {
          shapes.push({ kind: 'line', tone: 'thin', x1: x, y1: y, x2: x - 7, y2: y + 7 })
        }
        break
      }
      default:
        problems.push(`tipo de elemento desconocido: ${(element as { tipo: string }).tipo}`)
    }
  }

  for (const label of axisLabels) {
    const area = box(label)
    if (!outside(area) && !texts.some((t) => overlaps(area, box(t)))) {
      texts.push(label)
      shapes.push(label)
    }
  }

  for (let i = 0; i < texts.length; i++) {
    const a = box(texts[i])
    if (outside(a)) problems.push(`"${texts[i].text}" se sale del dibujo`)
    for (let j = i + 1; j < texts.length; j++) {
      if (overlaps(a, box(texts[j])))
        problems.push(`"${texts[i].text}" y "${texts[j].text}" se enciman`)
    }
  }

  return { width, height, shapes, problems }
}
