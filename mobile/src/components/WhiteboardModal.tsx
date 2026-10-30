import { useRef, useState, type ComponentRef } from 'react'
import { Modal, PanResponder, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Svg, { Path } from 'react-native-svg'
import { captureRef } from 'react-native-view-shot'
import { useColors } from '../theme/useColors'
import type { SolutionPhoto } from '../types/solution'
import { formatMath } from '../utils/formatMath'
import { notify } from '../utils/notify'
import { Button } from './Button'

// Hoja blanca y tinta azul lapicero también en modo oscuro: es lo que el tutor tiene que leer.
const PAPER = '#ffffff'
const INK = '#2452c4'

interface WhiteboardModalProps {
  visible: boolean
  statement: string
  onCancel: () => void
  onDone: (image: SolutionPhoto) => void
}

export function WhiteboardModal({ visible, statement, onCancel, onDone }: WhiteboardModalProps) {
  const colors = useColors()
  const { top, bottom } = useSafeAreaInsets()
  const board = useRef<ComponentRef<typeof View>>(null)
  const [strokes, setStrokes] = useState<string[]>([])
  const [current, setCurrent] = useState('')
  const [saving, setSaving] = useState(false)

  // Cada trazo es un "path" de SVG: M (inicio) y L (línea hasta el siguiente punto).
  // El trazo en curso vive en la closure del PanResponder, que se crea una sola vez.
  const [responder] = useState(() => {
    let path = ''
    const endStroke = () => {
      const finished = path
      if (finished) setStrokes((previous) => [...previous, finished])
      path = ''
      setCurrent('')
    }
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: ({ nativeEvent: { locationX, locationY } }) => {
        // El "l0.1 0" hace visible un toque suelto, como un punto decimal.
        path = `M${locationX.toFixed(1)} ${locationY.toFixed(1)} l0.1 0`
        setCurrent(path)
      },
      onPanResponderMove: ({ nativeEvent: { locationX, locationY } }) => {
        path += ` L${locationX.toFixed(1)} ${locationY.toFixed(1)}`
        setCurrent(path)
      },
      onPanResponderRelease: endStroke,
      onPanResponderTerminate: endStroke,
      onPanResponderTerminationRequest: () => false,
    })
  })

  const finish = async () => {
    setSaving(true)
    try {
      const uri = await captureRef(board, { format: 'png', result: 'tmpfile' })
      onDone({ uri, name: 'pizarra.png', type: 'image/png' })
    } catch (error) {
      notify.error(error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onCancel}>
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
        <View
          ref={board}
          collapsable={false}
          accessibilityLabel="Pizarra: escribe tu procedimiento con el dedo o un lápiz"
          style={[styles.board, { borderColor: colors.border }]}
          {...responder.panHandlers}
        >
          {/* Sin toques en el SVG: así las coordenadas siempre son relativas a la hoja. */}
          <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
            {[...strokes, current].map((d, index) =>
              d ? (
                <Path
                  key={index}
                  d={d}
                  stroke={INK}
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              ) : null,
            )}
          </Svg>
        </View>
        <View style={styles.row}>
          <View style={styles.flex}>
            <Button
              title="Deshacer"
              variant="secondary"
              disabled={strokes.length === 0}
              onPress={() => setStrokes((previous) => previous.slice(0, -1))}
            />
          </View>
          <View style={styles.flex}>
            <Button
              title="Borrar todo"
              variant="secondary"
              disabled={strokes.length === 0}
              onPress={() => setStrokes([])}
            />
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.flex}>
            <Button title="Cancelar" variant="secondary" onPress={onCancel} />
          </View>
          <View style={styles.flex}>
            <Button
              title="Usar dibujo"
              loading={saving}
              disabled={strokes.length === 0}
              onPress={finish}
            />
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, gap: 12, paddingHorizontal: 16 },
  title: { fontSize: 22, fontWeight: '700' },
  board: {
    flex: 1,
    overflow: 'hidden',
    borderWidth: 2,
    borderRadius: 16,
    backgroundColor: PAPER,
  },
  row: { flexDirection: 'row', gap: 12 },
  flex: { flex: 1 },
})
