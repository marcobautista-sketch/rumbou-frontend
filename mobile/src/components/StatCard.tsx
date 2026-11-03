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

// Un indicador: ícono, etiqueta y número, alineados como en el inicio y en la web.
export function StatCard({ icon, value, label, iconColor }: StatCardProps) {
  const colors = useColors()

  return (
    <View
      accessible
      accessibilityLabel={`${label}: ${value}`}
      style={[styles.card, { backgroundColor: colors.surface }]}
    >
      <Ionicons name={icon} size={20} color={iconColor ?? colors.primary} />
      <Text style={[styles.label, { color: colors.muted }]}>{label}</Text>
      <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: { flex: 1, gap: 2, borderRadius: 16, padding: 16 },
  label: { fontSize: 13, marginTop: 4 },
  value: { fontSize: 22, fontWeight: '800', fontVariant: ['tabular-nums'] },
})
