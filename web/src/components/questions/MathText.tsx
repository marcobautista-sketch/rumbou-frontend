import { useEffect, useState } from 'react'
import { formatMath } from '../../utils/formatMath'
import { splitMath } from '../../utils/splitMath'
import { currentTexRenderer, loadTexRenderer, type TexRenderer } from '../../utils/texRenderer'

function useTexRenderer() {
  const [render, setRender] = useState<TexRenderer | null>(currentTexRenderer)
  useEffect(() => {
    if (render) return
    let active = true
    loadTexRenderer()
      .then((loaded) => active && setRender(() => loaded))
      .catch(() => {})
    return () => {
      active = false
    }
  }, [render])
  return render
}

interface MathTextProps {
  // Texto con fórmulas: $...$ dentro del renglón y $$...$$ en su propio renglón.
  text?: string | null
  // Texto plano para las preguntas que todavía no tienen versión con formato.
  fallback?: string | null
  className?: string
}

// Mientras MathJax carga (o si falla), cada fórmula se ve como texto Unicode legible.
export function MathText({ text, fallback, className = '' }: MathTextProps) {
  const render = useTexRenderer()

  if (!text) {
    return <span className={`whitespace-pre-line ${className}`}>{formatMath(fallback ?? '')}</span>
  }

  return (
    <span className={`whitespace-pre-line ${className}`}>
      {splitMath(text).map((part, index) => {
        if (part.type === 'text') return <span key={index}>{part.value}</span>
        const display = part.type === 'display'
        const svg = render?.(part.value, display)
        const shape = display
          ? 'math-display my-3 block overflow-x-auto text-center'
          : 'math-inline'
        return svg ? (
          <span
            key={index}
            role="img"
            aria-label={formatMath(part.value)}
            className={shape}
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        ) : (
          <span key={index} className={shape}>
            {formatMath(part.value)}
          </span>
        )
      })}
    </span>
  )
}
