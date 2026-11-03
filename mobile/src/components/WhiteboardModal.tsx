import { Ionicons } from '@expo/vector-icons'
import { useState, type ComponentProps } from 'react'
import { Modal, PanResponder, Pressable, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Svg, { Defs, Path, Pattern, Rect } from 'react-native-svg'
import { useColors } from '../theme/useColors'
import { formatMath } from '../utils/formatMath'
import { Button } from './Button'

// Hoja cuadriculada blanca y tinta azul lapicero, también en modo oscuro: como un cuaderno.
const PAPER = '#ffffff'
const GRID = '#e3e8f2'
const INK = '#2452c4'

// Un trazo es un "path" de SVG; el del borrador pinta del color de la hoja.
export interface ScratchStroke {
  d: string
  erase?: boolean
}

interface WhiteboardModalProps {
  visible: boolean
  statement: string
  initialStrokes: ScratchStroke[]
  // Al volver a la pregunta, la pantalla guarda los trazos de esa pregunta.
  onClose: (strokes: ScratchStroke[]) => void
}

function Tool({
  icon,
  label,
  active,
  disabled,
  onPress,
}: {
  icon: ComponentProps<typeof Ionicons>['name']
  label: string
  active?: boolean
  disabled?: boolean
  onPress: () => void
}) {
  const colors = useColors()
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.tool,
        {
          backgroundColor: active ? colors.chip : 'transparent',
          opacity: disabled ? 0.4 : pressed ? 0.7 : 1,
        },
      ]}
    >
      <Ionicons name={icon} size={18} color={active ? colors.primary : colors.muted} />
      <Text style={[styles.toolText, { color: active ? colors.primary : colors.muted }]}>
        {label}
      </Text>
    </Pressable>
  )
}

// La pizarra de borrador de una pregunta: es solo para el postulante, no se envía a nadie.
export function WhiteboardModal({
  visible,
  statement,
  initialStrokes,
  onClose,
}: WhiteboardModalProps) {
  const colors = useColors()
  const { top, bottom } = useSafeAreaInsets()
  const [strokes, setStrokes] = useState<ScratchStroke[]>(initialStrokes)
  const [current, setCurrent] = useState<ScratchStroke | null>(null)
  const [erasing, setErasing] = useState(false)

  // El PanResponder se crea una sola vez: el trazo en curso y la herramienta viven en su
  // closure, y setErase cambia la herramienta desde los botones.
  const [board] = useState(() => {
    let path = ''
    let erase = false
    const endStroke = () => {
      const finished = path
      if (finished) setStrokes((previous) => [...previous, { d: finished, erase }])
      path = ''
      setCurrent(null)
    }
    const responder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: ({ nativeEvent: { locationX, locationY } }) => {
        // El "l0.1 0" hace visible un toque suelto, como un punto decimal.
        path = `M${locationX.toFixed(1)} ${locationY.toFixed(1)} l0.1 0`
        setCurrent({ d: path, erase })
      },
      onPanResponderMove: ({ nativeEvent: { locationX, locationY } }) => {
        path += ` L${locationX.toFixed(1)} ${locationY.toFixed(1)}`
        setCurrent({ d: path, erase })
      },
      onPanResponderRelease: endStroke,
      onPanResponderTerminate: endStroke,
      onPanResponderTerminationRequest: () => false,
    })
    return {
      handlers: responder.panHandlers,
      setErase: (value: boolean) => {
        erase = value
      },
    }
  })

  const chooseTool = (erase: boolean) => {
    board.setErase(erase)
    setErasing(erase)
  }

  const close = () => onClose(strokes)

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={close}>
      <View
        style={[
          styles.screen,
          { backgroundColor: colors.background, paddingTop: top + 12, paddingBottom: bottom + 12 },
        ]}
      >
        <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>
          Pizarra
        </Text>
        <Text numberOfLines={4} style={{ color: colors.muted }}>
          {formatMath(statement)}
        </Text>
        <View style={styles.tools}>
          <Tool icon="pencil" label="Lápiz" active={!erasing} onPress={() => chooseTool(false)} />
          <Tool
            icon="remove-circle-outline"
            label="Borrador"
            active={erasing}
            onPress={() => chooseTool(true)}
          />
          <View style={styles.flex} />
          <Tool
            icon="arrow-undo"
            label="Deshacer"
            disabled={strokes.length === 0}
            onPress={() => setStrokes((previous) => previous.slice(0, -1))}
          />
          <Tool
            icon="trash-outline"
            label="Borrar"
            disabled={strokes.length === 0}
            onPress={() => setStrokes([])}
          />
        </View>
        <View
          collapsable={false}
          accessibilityLabel="Pizarra: resuelve con el dedo o un lápiz"
          style={[styles.board, { borderColor: colors.border }]}
          {...board.handlers}
        >
          {/* Sin toques en el SVG: así las coordenadas siempre son relativas a la hoja. */}
          <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
            {[...strokes, ...(current ? [current] : [])].map((stroke, index) => (
              <Path
                key={index}
                d={stroke.d}
                stroke={stroke.erase ? PAPER : INK}
                strokeWidth={stroke.erase ? 22 : 3}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            ))}
            {/* La cuadrícula va encima, tenue: el borrador limpia la tinta pero no la hoja. */}
            <Defs>
              <Pattern id="cuadricula" width={24} height={24} patternUnits="userSpaceOnUse">
                <Path d="M 24 0 L 0 0 0 24" fill="none" stroke={GRID} strokeWidth={1} />
              </Pattern>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#cuadricula)" opacity={0.9} />
          </Svg>
        </View>
        <Text style={[styles.note, { color: colors.muted }]}>
          Solo la ves tú. Se guarda en esta pregunta mientras resuelves.
        </Text>
        <Button title="Volver a la pregunta" onPress={close} />
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, gap: 12, paddingHorizontal: 16 },
  title: { fontSize: 22, fontWeight: '800' },
  tools: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tool: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  toolText: { fontSize: 13, fontWeight: '600' },
  board: {
    flex: 1,
    overflow: 'hidden',
    borderWidth: 1,
    borderRadius: 16,
    backgroundColor: PAPER,
  },
  note: { fontSize: 12, textAlign: 'center' },
  flex: { flex: 1 },
})
