import { useEffect, useState } from 'react'
import { ScrollView, StyleSheet, Text, View, type StyleProp, type TextStyle } from 'react-native'
import { SvgXml } from 'react-native-svg'
import { useColors } from '../theme/useColors'
import { formatMath } from '../utils/formatMath'
import { splitMath, type MathPart } from '../utils/splitMath'
import { currentTexRenderer, loadTexRenderer, type TexRenderer } from '../utils/texRenderer'

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

type Block = { kind: 'flow'; parts: MathPart[] } | { kind: 'display'; tex: string }

// Corta el texto en bloques: cada $$...$$ y cada salto de línea empiezan un bloque nuevo.
function toBlocks(text: string): Block[] {
  const blocks: Block[] = []
  let flow: MathPart[] = []
  const closeFlow = () => {
    if (flow.length) blocks.push({ kind: 'flow', parts: flow })
    flow = []
  }
  for (const part of splitMath(text)) {
    if (part.type === 'display') {
      closeFlow()
      blocks.push({ kind: 'display', tex: part.value })
    } else if (part.type === 'inline') {
      flow.push(part)
    } else {
      part.value.split('\n').forEach((line, index) => {
        if (index > 0) closeFlow()
        if (line.trim()) flow.push({ type: 'text', value: line })
      })
    }
  }
  closeFlow()
  return blocks
}

interface FormulaProps {
  tex: string
  display: boolean
  fontSize: number
  color: string
  render: TexRenderer | null
  textStyle: StyleProp<TextStyle>
}

function Formula({ tex, display, fontSize, color, render, textStyle }: FormulaProps) {
  const svg = render?.(tex, display)
  if (!svg) return <Text style={textStyle}>{formatMath(tex)}</Text>
  const scale = fontSize * 1.08
  return (
    <View accessible accessibilityRole="image" accessibilityLabel={formatMath(tex)}>
      <SvgXml xml={svg.xml} width={svg.width * scale} height={svg.height * scale} color={color} />
    </View>
  )
}

interface MathTextProps {
  // Texto con fórmulas: $...$ dentro del renglón y $$...$$ en su propio renglón.
  text?: string | null
  // Texto plano para las preguntas que todavía no tienen versión con formato.
  fallback?: string | null
  fontSize?: number
  color?: string
  style?: StyleProp<TextStyle>
}

// Mientras MathJax carga (o si falla), cada fórmula se ve como texto Unicode legible.
export function MathText({ text, fallback, fontSize = 16, color, style }: MathTextProps) {
  const colors = useColors()
  const render = useTexRenderer()
  const ink = color ?? colors.text
  const textStyle = [{ fontSize, lineHeight: Math.round(fontSize * 1.45), color: ink }, style]

  if (!text) return <Text style={textStyle}>{formatMath(fallback ?? '')}</Text>

  return (
    <View style={styles.blocks}>
      {toBlocks(text).map((block, index) => {
        if (block.kind === 'display') {
          return (
            <ScrollView
              key={index}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.display}
            >
              <Formula
                tex={block.tex}
                display
                fontSize={fontSize}
                color={ink}
                render={render}
                textStyle={textStyle}
              />
            </ScrollView>
          )
        }
        // Sin fórmulas en el renglón, un Text normal corta mejor las palabras.
        if (block.parts.every((part) => part.type === 'text')) {
          return (
            <Text key={index} style={textStyle}>
              {block.parts.map((part) => part.value).join('')}
            </Text>
          )
        }
        return (
          <View key={index} style={styles.flow}>
            {block.parts.flatMap((part, partIndex) =>
              part.type === 'inline'
                ? [
                    <Formula
                      key={`${partIndex}`}
                      tex={part.value}
                      display={false}
                      fontSize={fontSize}
                      color={ink}
                      render={render}
                      textStyle={textStyle}
                    />,
                  ]
                : (part.value.match(/\s*\S+\s*/g) ?? []).map((word, wordIndex) => (
                    <Text key={`${partIndex}-${wordIndex}`} style={textStyle}>
                      {word}
                    </Text>
                  )),
            )}
          </View>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  blocks: { gap: 4 },
  flow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
  display: { flexGrow: 1, justifyContent: 'center', paddingVertical: 6 },
})
