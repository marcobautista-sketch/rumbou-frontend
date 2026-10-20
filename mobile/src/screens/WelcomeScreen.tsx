import { StyleSheet, Text, View } from 'react-native'
import { Button } from '../components/Button'
import { useAuth } from '../hooks/useAuth'
import { useColors } from '../theme/useColors'

export default function WelcomeScreen() {
  const colors = useColors()
  const { user, logout } = useAuth()

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.primary }]}>RumboU</Text>
      <Text style={[styles.subtitle, { color: colors.text }]}>Hola, {user?.nombre}</Text>
      <Text style={[styles.subtitle, { color: colors.muted }]}>
        Prepárate para el examen de admisión de la UNI y San Marcos con simulacros reales.
      </Text>
      <Button title="Cerrar sesión" variant="secondary" onPress={logout} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
})
