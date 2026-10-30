import { StyleSheet, Text } from 'react-native'
import { useColors } from '../theme/useColors'

interface ChipProps {
  label: string
  tone?: 'brand' | 'accent'
}

export function Chip({ label, tone = 'brand' }: ChipProps) {
  const colors = useColors()
  const toneStyle =
    tone === 'brand'
      ? { backgroundColor: colors.chip, color: colors.primary }
      : { backgroundColor: colors.accentSoft, color: colors.text }

  return <Text style={[styles.chip, toneStyle]}>{label}</Text>
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'flex-start',
    overflow: 'hidden',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
    fontWeight: '600',
  },
})
