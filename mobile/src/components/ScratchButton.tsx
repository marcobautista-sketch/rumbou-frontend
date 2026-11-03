import { Ionicons } from '@expo/vector-icons'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useColors } from '../theme/useColors'

// Botón "Pizarra" de una pregunta; el punto verde avisa que ya tiene apuntes.
export function ScratchButton({ hasNotes, onPress }: { hasNotes: boolean; onPress: () => void }) {
  const colors = useColors()
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={hasNotes ? 'Pizarra, con apuntes' : 'Pizarra'}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { borderColor: colors.border, backgroundColor: colors.surface, opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <Ionicons name="pencil" size={16} color={colors.primary} />
      <Text style={[styles.text, { color: colors.text }]}>Pizarra</Text>
      {hasNotes && <View style={[styles.dot, { backgroundColor: colors.accent }]} />}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  text: { fontSize: 14, fontWeight: '600' },
  dot: { width: 8, height: 8, borderRadius: 4 },
})
