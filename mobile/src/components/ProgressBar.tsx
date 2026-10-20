import { StyleSheet, View } from 'react-native'
import { useColors } from '../theme/useColors'

interface ProgressBarProps {
  value: number
  max: number
  label: string
}

export function ProgressBar({ value, max, label }: ProgressBarProps) {
  const colors = useColors()
  const percent = max > 0 ? Math.min(100, (value / max) * 100) : 0

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max, now: value }}
      style={[styles.track, { backgroundColor: colors.surfaceMuted }]}
    >
      <View style={[styles.fill, { width: `${percent}%`, backgroundColor: colors.accent }]} />
    </View>
  )
}

const styles = StyleSheet.create({
  track: {
    height: 8,
    overflow: 'hidden',
    borderRadius: 4,
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
})
