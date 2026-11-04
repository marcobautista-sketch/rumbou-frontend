import { Ionicons } from '@expo/vector-icons'
import { StyleSheet, Text, View } from 'react-native'
import { TouchableRipple } from 'react-native-paper'
import { useColors } from '../theme/useColors'
import type { ExamQuestion } from '../types/exam'
import { formatMath } from '../utils/formatMath'
import { AnswerReview } from './AnswerReview'
import { QuestionExplanation } from './QuestionExplanation'
import { QuestionStatement } from './QuestionStatement'

interface ExamAnswerItemProps {
  question: ExamQuestion
  position: number
  expanded: boolean
  onToggle: () => void
}

// Una pregunta de la revisión: cerrada muestra su estado y el inicio del enunciado; abierta,
// la respuesta y la explicación. Así las fórmulas solo se dibujan cuando hacen falta.
export function ExamAnswerItem({ question, position, expanded, onToggle }: ExamAnswerItemProps) {
  const colors = useColors()
  const blank = question.alternativaMarcada === null
  const status = blank ? 'En blanco' : question.esCorrecta ? 'Correcta' : 'Incorrecta'
  const tone = blank ? colors.muted : question.esCorrecta ? colors.success : colors.danger
  const icon = blank ? 'remove-circle' : question.esCorrecta ? 'checkmark-circle' : 'close-circle'

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: expanded ? colors.primary : colors.border,
        },
      ]}
    >
      <TouchableRipple
        onPress={onToggle}
        accessibilityRole="button"
        accessibilityLabel={`Pregunta ${position + 1}, ${status}, ${question.tema}`}
        accessibilityHint={
          expanded ? 'Ocultar la respuesta y su explicación' : 'Ver la respuesta y su explicación'
        }
        accessibilityState={{ expanded }}
        aria-expanded={expanded}
      >
        <View style={styles.header}>
          <View style={styles.row}>
            <View style={styles.flex}>
              <Text style={[styles.title, { color: colors.text }]}>Pregunta {position + 1}</Text>
              <Text style={[styles.topic, { color: colors.muted }]}>{question.tema}</Text>
            </View>
            <Ionicons
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={colors.muted}
              accessible={false}
            />
          </View>
          <View style={styles.status}>
            <Ionicons name={icon} size={18} color={tone} accessible={false} />
            <Text style={[styles.statusText, { color: tone }]}>{status}</Text>
          </View>
          {!expanded && (
            <Text numberOfLines={2} style={[styles.preview, { color: colors.muted }]}>
              {formatMath(question.enunciado)}
            </Text>
          )}
        </View>
      </TouchableRipple>
      {expanded && (
        <View style={[styles.detail, { borderTopColor: colors.border }]}>
          <QuestionStatement question={question} fontSize={16} />
          {question.claveCorrecta !== null && (
            <AnswerReview
              alternatives={question.alternativas}
              formatted={question.presentacion?.alternativas}
              correct={question.claveCorrecta}
              marked={question.alternativaMarcada}
            />
          )}
          <QuestionExplanation explanation={question.explicacion} steps={question.pasos} />
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  header: { gap: 8, padding: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  flex: { flex: 1, gap: 2 },
  title: { fontSize: 16, fontWeight: '700' },
  topic: { fontSize: 13, lineHeight: 18 },
  status: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusText: { fontSize: 13, fontWeight: '600' },
  preview: { fontSize: 14, lineHeight: 20 },
  detail: { gap: 14, padding: 16, borderTopWidth: 1 },
})
