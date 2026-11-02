import { useMemo } from 'react'
import { Platform, StyleSheet, Text, View } from 'react-native'
import Svg, {
  Circle,
  Defs,
  Line,
  Path,
  Pattern,
  Polygon,
  Rect,
  Text as SvgText,
} from 'react-native-svg'
import { useColors } from '../theme/useColors'
import { layoutFigure, type Figure, type StrokeTone } from '../utils/figure'

const SERIF = Platform.select({ ios: 'Times New Roman', default: 'serif' })

const strokeWidths: Record<StrokeTone, number> = { ink: 2.2, mark: 3.4, thin: 1.4, dash: 1.5 }

// Dibuja la figura de una pregunta sobre papel cuadriculado, con los colores del tema.
export function QuestionFigure({ figure }: { figure: Figure }) {
  const colors = useColors()
  const layout = useMemo(() => layoutFigure(figure), [figure])
  if (!layout.width) return null

  const strokeOf = (tone: StrokeTone) => ({
    stroke: tone === 'mark' ? colors.accent : colors.primary,
    strokeWidth: strokeWidths[tone],
    strokeOpacity: tone === 'thin' || tone === 'dash' ? 0.8 : 1,
    strokeDasharray: tone === 'dash' ? '5 5' : undefined,
    strokeLinecap: 'round' as const,
    fill: 'none',
  })

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={figure.descripcion}
      style={[styles.paper, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <Svg style={StyleSheet.absoluteFill}>
        <Defs>
          <Pattern id="cuadricula" width={18} height={18} patternUnits="userSpaceOnUse">
            <Path d="M18 0H0V18" stroke={colors.grid} strokeWidth={1} fill="none" />
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#cuadricula)" />
      </Svg>
      <View
        style={{
          width: '100%',
          maxWidth: layout.width,
          aspectRatio: layout.width / layout.height,
        }}
      >
        <Svg width="100%" height="100%" viewBox={`0 0 ${layout.width} ${layout.height}`}>
          {layout.shapes.map((shape, index) => {
            switch (shape.kind) {
              case 'area':
                return (
                  <Polygon
                    key={index}
                    points={shape.points}
                    fill={colors.primary}
                    fillOpacity={0.08}
                    stroke={colors.primary}
                    strokeWidth={2.2}
                    strokeLinejoin="round"
                  />
                )
              case 'line':
                return (
                  <Line
                    key={index}
                    x1={shape.x1}
                    y1={shape.y1}
                    x2={shape.x2}
                    y2={shape.y2}
                    {...strokeOf(shape.tone)}
                  />
                )
              case 'path':
                return <Path key={index} d={shape.d} {...strokeOf(shape.tone)} />
              case 'head':
                return (
                  <Polygon
                    key={index}
                    points={shape.points}
                    fill={shape.tone === 'mark' ? colors.accent : colors.primary}
                  />
                )
              case 'dot':
                return (
                  <Circle
                    key={index}
                    cx={shape.cx}
                    cy={shape.cy}
                    r={shape.r}
                    fill={shape.hollow ? colors.surface : colors.primary}
                    stroke={colors.primary}
                    strokeWidth={shape.hollow ? 2 : 0}
                  />
                )
              case 'text':
                return (
                  <SvgText
                    key={index}
                    x={shape.x}
                    y={shape.y}
                    fontSize={shape.size}
                    textAnchor="middle"
                    fill={shape.tone === 'mark' ? colors.accentText : colors.primary}
                    fillOpacity={shape.tone === 'small' ? 0.75 : 1}
                    fontWeight={shape.tone === 'mark' ? '700' : '500'}
                    fontStyle={shape.tone === 'variable' ? 'italic' : 'normal'}
                    fontFamily={shape.tone === 'variable' ? SERIF : undefined}
                  >
                    {shape.text}
                  </SvgText>
                )
            }
          })}
        </Svg>
      </View>
      <Text style={[styles.caption, { color: colors.muted }]}>Figura referencial</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  paper: {
    alignItems: 'center',
    gap: 4,
    overflow: 'hidden',
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
  },
  caption: { fontSize: 12 },
})
