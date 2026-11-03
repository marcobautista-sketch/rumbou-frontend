import { StyleSheet, View } from 'react-native'
import { ProgressBar as PaperProgressBar } from 'react-native-paper'
import { useColors } from '../theme/useColors'

interface ProgressBarProps {
  value: number
  max: number
  label: string
}

// Barra de avance (preguntas respondidas, desafíos de la semana): la ProgressBar de React
// Native Paper en el verde agua del progreso. Va dentro de una caja de alto fijo porque, en la
// versión web, Paper la estira al alto completo de su contenedor.
export function ProgressBar({ value, max, label }: ProgressBarProps) {
  const colors = useColors()
  const progress = max > 0 ? Math.min(1, value / max) : 0

  return (
    <View style={styles.box}>
      <PaperProgressBar
        progress={progress}
        color={colors.accent}
        accessibilityLabel={label}
        style={[styles.track, { backgroundColor: colors.surfaceMuted }]}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  box: { height: 8 },
  track: { height: 8, borderRadius: 4 },
})
