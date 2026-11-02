import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { useColors } from '../theme/useColors'
import type { SolutionStep } from '../types/presentation'
import { MathText } from './MathText'

function StepTable({ rows }: { rows: string[][] }) {
  const colors = useColors()
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={[styles.table, { borderColor: colors.border }]}>
        {rows.map((row, rowIndex) => (
          <View
            key={rowIndex}
            style={[
              styles.row,
              rowIndex === 0
                ? { backgroundColor: colors.surfaceMuted }
                : { borderTopWidth: 1, borderColor: colors.border },
            ]}
          >
            {row.map((cell, index) => (
              <View key={index} style={styles.cell}>
                <MathText
                  text={cell}
                  fontSize={rowIndex === 0 ? 13 : 15}
                  color={rowIndex === 0 ? colors.muted : colors.text}
                  style={rowIndex === 0 ? styles.headerCell : undefined}
                />
              </View>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  )
}

// La resolución en pasos numerados: un título corto, el detalle con sus fórmulas y una tabla opcional.
export function SolutionSteps({ steps }: { steps: SolutionStep[] }) {
  const colors = useColors()
  return (
    <View style={styles.list}>
      {steps.map((step, index) => (
        <View key={index} style={styles.step}>
          <View style={[styles.number, { backgroundColor: colors.primary }]}>
            <Text style={[styles.numberText, { color: colors.onPrimary }]}>{index + 1}</Text>
          </View>
          <View style={styles.body}>
            <MathText text={step.titulo} style={styles.title} />
            <MathText text={step.detalle} fontSize={15} />
            {step.tabla && step.tabla.length > 1 && <StepTable rows={step.tabla} />}
          </View>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  list: { gap: 14 },
  step: { flexDirection: 'row', gap: 10 },
  number: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
  },
  numberText: { fontSize: 13, fontWeight: '700' },
  body: { flex: 1, gap: 4 },
  title: { fontWeight: '700' },
  table: { borderWidth: 1, borderRadius: 10, overflow: 'hidden' },
  row: { flexDirection: 'row' },
  cell: { minWidth: 96, paddingHorizontal: 10, paddingVertical: 6 },
  headerCell: { fontWeight: '600', textTransform: 'uppercase' },
})
