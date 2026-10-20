import { Ionicons } from '@expo/vector-icons'
import { StyleSheet, Text, View } from 'react-native'
import { useColors } from '../theme/useColors'
import { formatMath } from '../utils/formatMath'

interface AnswerReviewProps {
  alternatives: string[]
  correct: number
  marked: number | null
}

export function AnswerReview({ alternatives, correct, marked }: AnswerReviewProps) {
  const colors = useColors()

  return (
    <View style={styles.list}>
      {alternatives.map((text, alternative) => {
        const isCorrect = alternative === correct
        const isWrongChoice = alternative === marked && !isCorrect
        const tone = isCorrect ? colors.success : isWrongChoice ? colors.danger : colors.border

        return (
          <View
            key={alternative}
            accessibilityLabel={`${formatMath(text)}${isCorrect ? ', respuesta correcta' : ''}${isWrongChoice ? ', tu respuesta' : ''}`}
            style={[
              styles.option,
              {
                borderColor: tone,
                backgroundColor: isCorrect
                  ? colors.successSoft
                  : isWrongChoice
                    ? colors.dangerSoft
                    : colors.surface,
              },
            ]}
          >
            {isCorrect || isWrongChoice ? (
              <Ionicons
                name={isCorrect ? 'checkmark-circle' : 'close-circle'}
                size={26}
                color={tone}
              />
            ) : (
              <Text style={[styles.letter, { color: colors.muted }]}>
                {String.fromCharCode(65 + alternative)}
              </Text>
            )}
            <Text
              style={[styles.label, { color: colors.text }, isWrongChoice && styles.crossedOut]}
            >
              {formatMath(text)}
            </Text>
          </View>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  list: {
    gap: 8,
  },
  option: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  letter: {
    width: 26,
    textAlign: 'center',
    fontWeight: '700',
  },
  label: {
    flex: 1,
    fontSize: 16,
  },
  crossedOut: {
    textDecorationLine: 'line-through',
  },
})
