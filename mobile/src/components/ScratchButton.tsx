import { StyleSheet, View } from 'react-native'
import { Badge, Button } from 'react-native-paper'
import { useColors } from '../theme/useColors'

// Botón "Pizarra" de una pregunta (botón de React Native Paper con ícono); el punto verde
// (Badge) avisa que ya tiene apuntes.
export function ScratchButton({ hasNotes, onPress }: { hasNotes: boolean; onPress: () => void }) {
  const colors = useColors()
  return (
    <View>
      <Button
        mode="outlined"
        icon="pencil"
        compact
        onPress={onPress}
        textColor={colors.text}
        accessibilityLabel={hasNotes ? 'Pizarra, con apuntes' : 'Pizarra'}
        style={[styles.button, { borderColor: colors.border }]}
        labelStyle={styles.label}
      >
        Pizarra
      </Button>
      {hasNotes && <Badge size={10} style={[styles.badge, { backgroundColor: colors.accent }]} />}
    </View>
  )
}

const styles = StyleSheet.create({
  button: { borderRadius: 10 },
  label: { fontSize: 14, fontWeight: '600', letterSpacing: 0 },
  badge: { position: 'absolute', top: -3, right: -3 },
})
