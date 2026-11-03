import { Eraser, PenLine, Trash2, Undo2 } from 'lucide-react'
import { useEffect, useRef, useState, type PointerEvent } from 'react'
import type { Stroke, StrokePoint } from '../../types/scratchpad'
import { Button } from '../ui/Button'

// Resolución fija de la hoja: el CSS la escala al ancho disponible y las coordenadas se convierten.
const WIDTH = 1500
const HEIGHT = 1000
// Tinta azul lapicero sobre hoja cuadriculada blanca, también en modo oscuro: como un cuaderno.
const INK = '#2452c4'
const ERASER_WIDTH = 40

const paperStyle = {
  backgroundColor: '#ffffff',
  backgroundImage:
    'linear-gradient(#e3e8f2 1px, transparent 1px), linear-gradient(90deg, #e3e8f2 1px, transparent 1px)',
  backgroundSize: 'calc(100% / 30) calc(100% / 20)',
}

const round = (value: number) => Math.round(value * 10) / 10

// Pinta un trazo (o solo su último tramo, mientras se dibuja). El borrador quita la tinta y deja
// ver la cuadrícula, que es el fondo de la hoja y no parte del dibujo.
function paint(context: CanvasRenderingContext2D, stroke: Stroke, fromIndex = 0) {
  const { points } = stroke
  context.globalCompositeOperation = stroke.erase ? 'destination-out' : 'source-over'
  if (fromIndex === 0) {
    const [first] = points
    context.beginPath()
    context.arc(first.x, first.y, first.width / 2, 0, Math.PI * 2)
    context.fill()
  }
  for (let i = Math.max(1, fromIndex); i < points.length; i++) {
    context.lineWidth = points[i].width
    context.beginPath()
    context.moveTo(points[i - 1].x, points[i - 1].y)
    context.lineTo(points[i].x, points[i].y)
    context.stroke()
  }
}

interface ScratchpadProps {
  initialStrokes: Stroke[]
  onChange: (strokes: Stroke[]) => void
}

// Hoja de borrador para resolver una pregunta: con mouse, dedo o lápiz de tablet (con presión).
// Si se usa un lápiz, la palma que se apoya en la pantalla no dibuja.
export function Scratchpad({ initialStrokes, onChange }: ScratchpadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const strokes = useRef<Stroke[]>(initialStrokes)
  const drawing = useRef(false)
  const penSeen = useRef(false)
  const [strokeCount, setStrokeCount] = useState(initialStrokes.length)
  const [erasing, setErasing] = useState(false)

  const context = () => {
    const ctx = canvasRef.current?.getContext('2d')
    if (ctx) {
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.strokeStyle = INK
      ctx.fillStyle = INK
    }
    return ctx
  }

  const redraw = () => {
    const ctx = context()
    if (!ctx) return
    ctx.clearRect(0, 0, WIDTH, HEIGHT)
    strokes.current.forEach((stroke) => paint(ctx, stroke))
  }

  const commit = () => {
    setStrokeCount(strokes.current.length)
    onChange([...strokes.current])
  }

  const undo = () => {
    if (strokes.current.length === 0) return
    strokes.current = strokes.current.slice(0, -1)
    redraw()
    commit()
  }

  const clear = () => {
    strokes.current = []
    redraw()
    commit()
  }

  // Al abrirla se repinta lo que ya se había escrito en esta pregunta.
  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = INK
    ctx.fillStyle = INK
    strokes.current.forEach((stroke) => paint(ctx, stroke))
  }, [])

  // Ctrl+Z (o Cmd+Z) deshace el último trazo, como en cualquier editor.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault()
        undo()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  const toPoint = (event: PointerEvent<HTMLCanvasElement>): StrokePoint => {
    const rect = event.currentTarget.getBoundingClientRect()
    // El lápiz de una tablet trae presión real; el mouse y el dedo, un grosor fijo.
    const width = erasing
      ? ERASER_WIDTH
      : event.pointerType === 'pen'
        ? 2.5 + event.pressure * 6
        : 4
    return {
      x: round(((event.clientX - rect.left) * WIDTH) / rect.width),
      y: round(((event.clientY - rect.top) * HEIGHT) / rect.height),
      width: round(width),
    }
  }

  const start = (event: PointerEvent<HTMLCanvasElement>) => {
    if (event.pointerType === 'pen') penSeen.current = true
    if (penSeen.current && event.pointerType === 'touch') return
    event.currentTarget.setPointerCapture(event.pointerId)
    drawing.current = true
    const stroke: Stroke = { points: [toPoint(event)], ...(erasing ? { erase: true } : {}) }
    strokes.current = [...strokes.current, stroke]
    const ctx = context()
    if (ctx) paint(ctx, stroke)
  }

  const move = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return
    const stroke = strokes.current[strokes.current.length - 1]
    stroke.points.push(toPoint(event))
    const ctx = context()
    if (ctx) paint(ctx, stroke, stroke.points.length - 1)
  }

  const end = () => {
    if (!drawing.current) return
    drawing.current = false
    commit()
  }

  const toolStyles = (active: boolean) =>
    `inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-accent ${
      active ? 'bg-chip text-primary' : 'text-ink-muted hover:bg-surface-muted hover:text-ink'
    }`

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div role="group" aria-label="Herramienta" className="flex gap-1">
          <button
            type="button"
            aria-pressed={!erasing}
            onClick={() => setErasing(false)}
            className={toolStyles(!erasing)}
          >
            <PenLine aria-hidden className="size-4" /> Lápiz
          </button>
          <button
            type="button"
            aria-pressed={erasing}
            onClick={() => setErasing(true)}
            className={toolStyles(erasing)}
          >
            <Eraser aria-hidden className="size-4" /> Borrador
          </button>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={undo} disabled={strokeCount === 0}>
            <Undo2 aria-hidden className="size-4" /> Deshacer
          </Button>
          <Button variant="ghost" size="sm" onClick={clear} disabled={strokeCount === 0}>
            <Trash2 aria-hidden className="size-4" /> Borrar hoja
          </Button>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        width={WIDTH}
        height={HEIGHT}
        role="img"
        aria-label="Pizarra: resuelve con el mouse, el dedo o un lápiz"
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerCancel={end}
        style={paperStyle}
        className={`aspect-[3/2] w-full touch-none rounded-xl border border-line ${
          erasing ? 'cursor-cell' : 'cursor-crosshair'
        }`}
      />
    </div>
  )
}
