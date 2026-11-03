import type { ReactNode } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import type { Palette } from '../theme/colors'
import { useColors } from '../theme/useColors'
import type { Goal, PreparationStatus } from '../types/goal'
import { formatScore } from '../utils/examLabels'
import { areaLabel } from '../utils/universityLabels'
import { GoalProgress } from './GoalProgress'

// Los mismos tonos que la web para cada zona de preparación.
const statusTones: Record<PreparationStatus, { color: keyof Palette; background: keyof Palette }> =
  {
    HOLGADO: { color: 'success', background: 'successSoft' },
    AJUSTADO: { color: 'primary', background: 'chip' },
    CERCA: { color: 'warning', background: 'warningSoft' },
    REFORZAR: { color: 'danger', background: 'dangerSoft' },
  }

function Metric({ label, value, color }: { label: string; value: string; color: string }) {
  const colors = useColors()
  return (
    <View style={styles.metric}>
      <Text style={[styles.metricLabel, { color: colors.muted }]}>{label}</Text>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
    </View>
  )
}

// La carrera meta y qué tan cerca está el postulante de su último ingresante. La usan el
// inicio y la pestaña de metas.
export function GoalSummary({ goal, footer }: { goal: Goal; footer?: ReactNode }) {
  const colors = useColors()
  const tone = goal.estado ? statusTones[goal.estado] : null
  const psp = goal.ultimoPsp
  const cutoff = goal.puntajeUltimoIngresante
  const difference = psp === null ? 0 : psp - cutoff

  return (
    <View style={styles.wrapper}>
      <View style={styles.between}>
        <Text style={[styles.eyebrow, { color: colors.primary }]}>
          {areaLabel(goal.universidad, goal.area)} · Proceso {goal.procesoAdmision}
        </Text>
        {tone && goal.estadoDescripcion && (
          <Text
            style={[
              styles.badge,
              { color: colors[tone.color], backgroundColor: colors[tone.background] },
            ]}
          >
            {goal.estadoDescripcion}
          </Text>
        )}
      </View>
      <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>
        {goal.carrera}
      </Text>
      {psp === null ? (
        <Text style={[styles.note, { color: colors.muted, backgroundColor: colors.surfaceMuted }]}>
          El último ingresante obtuvo {formatScore(cutoff)} puntos. Rinde tu diagnóstico o un
          simulacro completo para calcular tu puntaje proyectado.
        </Text>
      ) : (
        <>
          <View style={styles.metrics}>
            <Metric label="Tu puntaje proyectado" value={formatScore(psp)} color={colors.primary} />
            <Metric label="Último ingresante" value={formatScore(cutoff)} color={colors.text} />
            <Metric
              label={difference >= 0 ? 'Lo superas por' : 'Te faltan'}
              value={formatScore(Math.round(Math.abs(difference)))}
              color={difference >= 0 ? colors.success : colors.text}
            />
          </View>
          <GoalProgress score={psp} cutoff={cutoff} />
        </>
      )}
      {footer}
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: { gap: 10 },
  between: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  eyebrow: { fontSize: 13, fontWeight: '700' },
  badge: {
    overflow: 'hidden',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
    fontSize: 12,
    fontWeight: '700',
  },
  title: { fontSize: 21, fontWeight: '800' },
  note: { borderRadius: 12, padding: 12, lineHeight: 20 },
  metrics: { flexDirection: 'row', alignItems: 'stretch', gap: 10, marginTop: 4 },
  metric: { flex: 1, gap: 2, justifyContent: 'space-between' },
  metricLabel: { fontSize: 12 },
  metricValue: { fontSize: 24, fontWeight: '800', fontVariant: ['tabular-nums'] },
})
