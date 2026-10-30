import { Eraser, Undo2 } from 'lucide-react'
import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { formatMath } from '../../utils/formatMath'
import { Button } from '../ui/Button'

interface Point {
  x: number
  y: number
  width: number
}

// Resolución fija del lienzo: el CSS lo escala al ancho disponible y las coordenadas se convierten.
const WIDTH = 1500
const HEIGHT = 1000
// Hoja blanca y tinta azul lapicero también en modo oscuro: es lo que el tutor tiene que leer.
const PAPER = '#ffffff'
const INK = '#2452c4'

function paint(context: CanvasRenderingContext2D, stroke: Point[]) {
  const [first] = stroke
  context.beginPath()
  context.arc(first.x, first.y, first.width / 2, 0, Math.PI * 2)
  context.fill()
  for (let i = 1; i < stroke.length; i++) {
    context.lineWidth = stroke[i].width
    context.beginPath()
    context.moveTo(stroke[i - 1].x, stroke[i - 1].y)
    context.lineTo(stroke[i].x, stroke[i].y)
    context.stroke()
  }
}

interface WhiteboardProps {
  statement: string
  onCancel: () => void
  onDone: (image: Blob) => void
}

export function Whiteboard({ statement, onCancel, onDone }: WhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const strokes = useRef<Point[][]>([])
  const drawing = useRef(false)
  const penSeen = useRef(false)
  const [strokeCount, setStrokeCount] = useState(0)

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
    ctx.fillStyle = PAPER
    ctx.fillRect(0, 0, WIDTH, HEIGHT)
    ctx.fillStyle = INK
    strokes.current.forEach((stroke) => paint(ctx, stroke))
    setStrokeCount(strokes.current.length)
  }

  // El lienzo nace transparente: se pinta la hoja para que el PNG no salga con fondo negro.
  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = PAPER
    ctx.fillRect(0, 0, WIDTH, HEIGHT)
  }, [])

  const toPoint = (event: PointerEvent<HTMLCanvasElement>): Point => {
    const rect = event.currentTarget.getBoundingClientRect()
    // El lápiz de una tablet trae presión real; el mouse y el dedo, un grosor fijo.
    const width = event.pointerType === 'pen' ? 3 + event.pressure * 7 : 6
    return {
      x: ((event.clientX - rect.left) * WIDTH) / rect.width,
      y: ((event.clientY - rect.top) * HEIGHT) / rect.height,
      width,
    }
  }

  const start = (event: PointerEvent<HTMLCanvasElement>) => {
    if (event.pointerType === 'pen') penSeen.current = true
    // Con lápiz, la palma que se apoya en la pantalla no debe dibujar.
    if (penSeen.current && event.pointerType === 'touch') return
    event.currentTarget.setPointerCapture(event.pointerId)
    drawing.current = true
    const point = toPoint(event)
    strokes.current.push([point])
    const ctx = context()
    if (ctx) paint(ctx, [point])
  }

  const move = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return
    const stroke = strokes.current[strokes.current.length - 1]
    const point = toPoint(event)
    stroke.push(point)
    const ctx = context()
    if (ctx) paint(ctx, stroke.slice(-2))
  }

  const end = () => {
    if (!drawing.current) return
    drawing.current = false
    setStrokeCount(strokes.current.length)
  }

  const undo = () => {
    strokes.current.pop()
    redraw()
  }

  const clear = () => {
    strokes.current = []
    redraw()
  }

  const finish = () => {
    canvasRef.current?.toBlob((blob) => blob && onDone(blob), 'image/png')
  }

  return (
    <div className="space-y-3">
      <p className="max-h-24 overflow-y-auto rounded-xl bg-surface-muted p-3 text-sm whitespace-pre-line">
        {formatMath(statement)}
      </p>
      <canvas
        ref={canvasRef}
        width={WIDTH}
        height={HEIGHT}
        role="img"
        aria-label="Pizarra: escribe tu procedimiento con el mouse, el dedo o un lápiz"
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerCancel={end}
        className="aspect-[3/2] w-full cursor-crosshair touch-none rounded-xl border-2 border-line"
      />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={undo} disabled={strokeCount === 0}>
            <Undo2 aria-hidden className="size-4" /> Deshacer
          </Button>
          <Button variant="ghost" size="sm" onClick={clear} disabled={strokeCount === 0}>
            <Eraser aria-hidden className="size-4" /> Borrar todo
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
          <Button onClick={finish} disabled={strokeCount === 0}>
            Usar este dibujo
          </Button>
        </div>
      </div>
    </div>
  )
}
