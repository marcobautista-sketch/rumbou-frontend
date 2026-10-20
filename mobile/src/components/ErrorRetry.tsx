import { Ionicons } from '@expo/vector-icons'
import { StyleSheet, Text, View } from 'react-native'
import { useColors } from '../theme/useColors'
import { Button } from './Button'

interface ErrorRetryProps {
  message: string
  onRetry: () => void
}

export function ErrorRetry({ message, onRetry }: ErrorRetryProps) {
  const colors = useColors()

  return (
    <View
      accessibilityRole="alert"
      style={[styles.container, { backgroundColor: colors.dangerSoft }]}
    >
      <Ionicons name="alert-circle-outline" size={28} color={colors.danger} />
      <Text style={[styles.message, { color: colors.danger }]}>{message}</Text>
      <Button title="Reintentar" variant="secondary" onPress={onRetry} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    padding: 20,
  },
  message: {
    fontSize: 15,
    textAlign: 'center',
  },
})
