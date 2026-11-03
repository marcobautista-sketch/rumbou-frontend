import { StyleSheet, Text, View } from 'react-native'
import { useColors } from '../theme/useColors'
import { formatScore } from '../utils/examLabels'

// El último ingresante queda fijo al 80 % de la barra: así se ve tanto lo que falta como lo
// que sobra cuando el puntaje lo supera. Es la misma barra de la web.
const CUTOFF_POSITION = 0.8

export function GoalProgress({ score, cutoff }: { score: number; cutoff: number }) {
  const colors = useColors()
  const fill = Math.min(100, Math.max(2, (score / (cutoff / CUTOFF_POSITION)) * 100))
  const percentage = Math.round((score / cutoff) * 100)
  const reached = score >= cutoff

  return (
    <View
      accessible
      accessibilityLabel={`Tu puntaje proyectado es ${formatScore(score)}, el ${percentage} % del último ingresante (${formatScore(cutoff)}).`}
      style={styles.wrapper}
    >
      <View style={[styles.track, { backgroundColor: colors.surfaceMuted }]}>
        <View
          style={[
            styles.fill,
            { width: `${fill}%`, backgroundColor: reached ? colors.success : colors.accent },
          ]}
        />
        <View
          style={[
            styles.marker,
            { left: `${CUTOFF_POSITION * 100}%`, backgroundColor: colors.text },
          ]}
        />
      </View>
      <View style={styles.labels}>
        <Text style={[styles.small, { color: colors.muted }]}>0</Text>
        <Text
          style={[
            styles.small,
            styles.cutoffLabel,
            { color: colors.text, left: `${CUTOFF_POSITION * 100 - 18}%` },
          ]}
        >
          Último ingresante
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: { gap: 6 },
  track: { height: 12, borderRadius: 6, justifyContent: 'center' },
  fill: { height: 12, borderRadius: 6 },
  marker: { position: 'absolute', top: -5, bottom: -5, width: 2, borderRadius: 1 },
  labels: { height: 18 },
  small: { fontSize: 12 },
  cutoffLabel: { position: 'absolute', fontWeight: '700' },
})
