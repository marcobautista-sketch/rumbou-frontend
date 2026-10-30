import { Ionicons } from '@expo/vector-icons'
import type { ComponentProps } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useColors } from '../theme/useColors'

interface StatCardProps {
  icon: ComponentProps<typeof Ionicons>['name']
  value: string | number
  label: string
  iconColor?: string
}

export function StatCard({ icon, value, label, iconColor }: StatCardProps) {
  const colors = useColors()

  return (
    <View
      accessibilityLabel={`${label}: ${value}`}
      style={[styles.card, { backgroundColor: colors.surface }]}
    >
      <Ionicons name={icon} size={26} color={iconColor ?? colors.accentText} />
      <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.label, { color: colors.muted }]}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: { flex: 1, alignItems: 'center', gap: 2, borderRadius: 16, padding: 16 },
  value: { fontSize: 22, fontWeight: '700' },
  label: { fontSize: 12, fontWeight: '600', letterSpacing: 0.5, textAlign: 'center' },
})
