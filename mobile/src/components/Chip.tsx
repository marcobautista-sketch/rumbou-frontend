import { StyleSheet } from 'react-native'
import { Chip as PaperChip } from 'react-native-paper'
import { useColors } from '../theme/useColors'

interface ChipProps {
  label: string
  tone?: 'brand' | 'accent'
}

// Etiqueta informativa (el tema de una pregunta, el puntaje en juego): el Chip de React Native
// Paper, compacto y sin acción.
export function Chip({ label, tone = 'brand' }: ChipProps) {
  const colors = useColors()
  const brand = tone === 'brand'

  return (
    <PaperChip
      compact
      style={[styles.chip, { backgroundColor: brand ? colors.chip : colors.accentSoft }]}
      textStyle={[styles.text, { color: brand ? colors.primary : colors.text }]}
    >
      {label}
    </PaperChip>
  )
}

const styles = StyleSheet.create({
  chip: { alignSelf: 'flex-start', borderRadius: 999 },
  text: { fontWeight: '600', marginVertical: 2 },
})
