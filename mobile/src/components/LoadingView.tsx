import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { useColors } from '../theme/useColors'

export function LoadingView() {
  const colors = useColors()

  return (
    <View
      accessibilityLabel="Cargando"
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
