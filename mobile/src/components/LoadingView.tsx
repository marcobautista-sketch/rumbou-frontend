import { StyleSheet, View } from 'react-native'
import { ActivityIndicator } from 'react-native-paper'
import { useColors } from '../theme/useColors'

export function LoadingView() {
  const colors = useColors()

  return (
    <View
      accessibilityLabel="Cargando"
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ActivityIndicator size="large" />
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
