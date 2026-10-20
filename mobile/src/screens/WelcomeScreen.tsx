import { StyleSheet, Text, View } from 'react-native'
import { useColors } from '../theme/useColors'

export default function WelcomeScreen() {
  const colors = useColors()

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.primary }]}>RumboU</Text>
      <Text style={[styles.subtitle, { color: colors.muted }]}>
        Prepárate para el examen de admisión de la UNI y San Marcos con simulacros reales.
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
})
