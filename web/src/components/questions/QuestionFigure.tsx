import { useMemo } from 'react'
import { layoutFigure, type Figure } from '../../utils/figure'

// Dibuja la figura de una pregunta sobre papel cuadriculado, con los colores del tema.
export function QuestionFigure({ figure }: { figure: Figure }) {
  const layout = useMemo(() => layoutFigure(figure), [figure])
  if (!layout.width) return null

  return (
    <figure className="figure-paper flex flex-col items-center gap-1 rounded-xl border border-line p-3">
      <svg
        viewBox={`0 0 ${layout.width} ${layout.height}`}
        width={layout.width}
        role="img"
        aria-label={figure.descripcion}
        className="h-auto max-w-full"
      >
        {layout.shapes.map((shape, index) => {
          switch (shape.kind) {
            case 'area':
              return <polygon key={index} className="fig-area" points={shape.points} />
            case 'line':
              return (
                <line
                  key={index}
                  className={`fig-${shape.tone}`}
                  x1={shape.x1}
                  y1={shape.y1}
                  x2={shape.x2}
                  y2={shape.y2}
                />
              )
            case 'path':
              return <path key={index} className={`fig-${shape.tone}`} d={shape.d} />
            case 'head':
              return (
                <polygon key={index} className={`fig-head-${shape.tone}`} points={shape.points} />
              )
            case 'dot':
              return (
                <circle
                  key={index}
                  className={shape.hollow ? 'fig-hollow' : 'fig-dot'}
                  cx={shape.cx}
                  cy={shape.cy}
                  r={shape.r}
                />
              )
            case 'text':
              return (
                <text
                  key={index}
                  className={`fig-text-${shape.tone}`}
                  x={shape.x}
                  y={shape.y}
                  fontSize={shape.size}
                  textAnchor="middle"
                >
                  {shape.text}
                </text>
              )
          }
        })}
      </svg>
      <figcaption className="text-xs text-ink-muted">Figura referencial</figcaption>
    </figure>
  )
}
