import { Ionicons } from '@expo/vector-icons'
import { useNetInfo } from '@react-native-community/netinfo'
import { StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useColors } from '../theme/useColors'

// Mientras NetInfo comprueba, isInternetReachable vale null: solo se avisa con un false seguro.
export function OfflineBanner() {
  const colors = useColors()
  const { top } = useSafeAreaInsets()
  const { isConnected, isInternetReachable } = useNetInfo()

  if (isConnected !== false && isInternetReachable !== false) return null

  return (
    <View
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={[styles.banner, { backgroundColor: colors.dangerSoft, paddingTop: top + 8 }]}
    >
      <Ionicons name="cloud-offline-outline" size={20} color={colors.danger} />
      <Text style={[styles.text, { color: colors.danger }]}>
        Sin conexión a internet. Revisa tu Wi-Fi o tus datos móviles.
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  text: { flex: 1, fontWeight: '600' },
})
