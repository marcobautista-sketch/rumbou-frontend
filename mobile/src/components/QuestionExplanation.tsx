import { StyleSheet, Text, View } from 'react-native'
import { useColors } from '../theme/useColors'
import type { SolutionStep } from '../types/presentation'
import { MathText } from './MathText'
import { SolutionSteps } from './SolutionSteps'

interface QuestionExplanationProps {
  explanation: string | null
  // La misma explicación ordenada en pasos; si existe, se muestra en lugar del párrafo.
  steps?: SolutionStep[] | null
}

export function QuestionExplanation({ explanation, steps }: QuestionExplanationProps) {
  const colors = useColors()
  if (!steps?.length && !explanation) return null

  return (
    <View style={[styles.box, { backgroundColor: colors.surfaceMuted }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        {steps?.length ? 'Resolución' : 'Explicación'}
      </Text>
      {steps?.length ? (
        <SolutionSteps steps={steps} />
      ) : (
        <MathText fallback={explanation} fontSize={15} color={colors.muted} />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  box: { gap: 10, borderRadius: 12, padding: 14 },
  title: { fontWeight: '700' },
})
