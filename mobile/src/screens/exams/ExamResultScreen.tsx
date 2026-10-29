import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useCallback } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { AnswerReview } from '../../components/AnswerReview'
import { Button } from '../../components/Button'
import { ErrorRetry } from '../../components/ErrorRetry'
import { LoadingView } from '../../components/LoadingView'
import { StatCard } from '../../components/StatCard'
import { useFetch } from '../../hooks/useFetch'
import type { RootStackParamList } from '../../navigation/types'
import { examService } from '../../services/examService'
import { useColors } from '../../theme/useColors'
import { countAnswers, examTypeLabels, formatScore } from '../../utils/examLabels'
import { formatMath } from '../../utils/formatMath'

type ExamResultScreenProps = NativeStackScreenProps<RootStackParamList, 'ExamResult'>

export default function ExamResultScreen({ navigation, route }: ExamResultScreenProps) {
  const colors = useColors()
  const { examId } = route.params
  const fetchExam = useCallback(
    (signal: AbortSignal) => examService.getDetail(examId, signal),
    [examId],
  )
  const { data: exam, error, loading, retry } = useFetch(fetchExam)

  if (loading) return <LoadingView />
  if (error || !exam) {
    return (
      <View style={styles.content}>
        <ErrorRetry message={error?.message ?? 'No pudimos cargar tu resultado.'} onRetry={retry} />
      </View>
    )
  }

  const { correct, incorrect, blank } = countAnswers(exam.preguntas)

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
    >
      <Text style={{ color: colors.muted }}>{examTypeLabels[exam.tipo]}</Text>
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text style={{ color: colors.muted }}>Puntaje obtenido</Text>
        <Text style={[styles.score, { color: colors.primary }]}>
          {formatScore(exam.puntajeObtenido)}
        </Text>
        <Text style={{ color: colors.muted }}>
          Puntaje simulado proyectado (PSP): {formatScore(exam.psp)}
        </Text>
      </View>

      <View style={styles.row}>
        <StatCard
          icon="checkmark-circle"
          iconColor={colors.success}
          value={correct}
          label="Correctas"
        />
        <StatCard
          icon="close-circle"
          iconColor={colors.danger}
          value={incorrect}
          label="Incorrectas"
        />
        <StatCard icon="remove-circle" iconColor={colors.muted} value={blank} label="En blanco" />
      </View>

      <Button
        title="Ver mi plan de estudio"
        onPress={() => navigation.navigate('StudyPlan', { examId })}
      />
      <Button
        title="Rendir otro simulacro"
        variant="secondary"
        onPress={() => navigation.replace('NewExam')}
      />

      <Text style={[styles.heading, { color: colors.text }]}>Revisa tus respuestas</Text>
      {exam.preguntas.map((question, position) => (
        <View
          key={question.respuestaUsuarioId}
          style={[styles.card, { backgroundColor: colors.surface }]}
        >
          <Text style={[styles.questionTitle, { color: colors.text }]}>
            {position + 1}. {formatMath(question.enunciado)}
          </Text>
          {question.claveCorrecta !== null && (
            <AnswerReview
              alternatives={question.alternativas}
              correct={question.claveCorrecta}
              marked={question.alternativaMarcada}
            />
          )}
          {question.explicacion && (
            <Text style={{ color: colors.muted }}>{formatMath(question.explicacion)}</Text>
          )}
        </View>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  content: { gap: 14, padding: 20 },
  row: { flexDirection: 'row', gap: 10 },
  card: { gap: 8, borderRadius: 16, padding: 16 },
  score: { fontSize: 40, fontWeight: '700' },
  heading: { fontSize: 18, fontWeight: '700' },
  questionTitle: { fontSize: 16, lineHeight: 24 },
})
