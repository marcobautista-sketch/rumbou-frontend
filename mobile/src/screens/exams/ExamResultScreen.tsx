import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useCallback, useState } from 'react'
import { FlatList, StyleSheet, Text, View } from 'react-native'
import { Button } from '../../components/Button'
import { ErrorRetry } from '../../components/ErrorRetry'
import { ExamAnswerItem } from '../../components/ExamAnswerItem'
import { GoalProgress } from '../../components/GoalProgress'
import { LoadingView } from '../../components/LoadingView'
import { StatCard } from '../../components/StatCard'
import { useFetch } from '../../hooks/useFetch'
import type { RootStackParamList } from '../../navigation/types'
import { areaService } from '../../services/areaService'
import { examService } from '../../services/examService'
import { goalService } from '../../services/goalService'
import { useColors } from '../../theme/useColors'
import { countAnswers, examTypeLabels, formatScore } from '../../utils/examLabels'
import { areaLabel, universityMaxScore } from '../../utils/universityLabels'

type ExamResultScreenProps = NativeStackScreenProps<RootStackParamList, 'ExamResult'>

export default function ExamResultScreen({ navigation, route }: ExamResultScreenProps) {
  const colors = useColors()
  const { examId } = route.params
  const [expandedAnswerId, setExpandedAnswerId] = useState<number | null>(null)
  const fetchExam = useCallback(
    (signal: AbortSignal) => examService.getDetail(examId, signal),
    [examId],
  )
  const { data: exam, error, loading, retry } = useFetch(fetchExam)
  const fetchAreas = useCallback((signal: AbortSignal) => areaService.list(signal), [])
  const fetchGoals = useCallback((signal: AbortSignal) => goalService.list(signal), [])
  const areas = useFetch(fetchAreas)
  const goals = useFetch(fetchGoals)

  if (loading) return <LoadingView />
  if (error || !exam) {
    return (
      <View style={styles.content}>
        <ErrorRetry message={error?.message ?? 'No pudimos cargar tu resultado.'} onRetry={retry} />
      </View>
    )
  }

  const { correct, incorrect, blank } = countAnswers(exam.preguntas)
  const area = areas.data?.find((candidate) => candidate.id === exam.areaId)
  const goal = goals.data?.find((candidate) => candidate.areaId === exam.areaId) ?? null
  const maxScore = universityMaxScore(area?.universidad)
  const fullExam = exam.tipo !== 'POR_TEMA'
  const total = exam.preguntas.length
  const accuracy = total ? Math.round((correct / total) * 100) : 0

  const summary = (
    <View style={styles.summary}>
      <Text style={[styles.context, { color: colors.primary }]}>
        {examTypeLabels[exam.tipo]}
        {area ? ` · ${areaLabel(area.universidad, area.nombre)}` : ''}
      </Text>
      {fullExam ? (
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={{ color: colors.muted }}>Tu puntaje</Text>
          <Text style={[styles.score, { color: colors.primary }]}>
            {formatScore(exam.puntajeObtenido)}
            {maxScore !== null && (
              <Text style={[styles.max, { color: colors.muted }]}> / {formatScore(maxScore)}</Text>
            )}
          </Text>
          {goal && exam.psp !== null ? (
            <>
              <GoalProgress score={exam.psp} cutoff={goal.puntajeUltimoIngresante} />
              <Text style={{ color: colors.muted }}>
                {exam.psp >= goal.puntajeUltimoIngresante
                  ? `Con este resultado superas por ${formatScore(Math.round(exam.psp - goal.puntajeUltimoIngresante))} puntos al último ingresante de ${goal.carrera}.`
                  : `Con este resultado te faltan ${formatScore(Math.round(goal.puntajeUltimoIngresante - exam.psp))} puntos para alcanzar al último ingresante de ${goal.carrera}.`}
              </Text>
            </>
          ) : (
            <Text style={{ color: colors.muted }}>
              Elige una carrera meta de este examen para compararte con su último ingresante.
            </Text>
          )}
        </View>
      ) : (
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.row}>
            <View style={styles.flex}>
              <Text style={{ color: colors.muted }}>
                Puntaje en {exam.preguntas[0]?.tema ?? 'el tema'}
              </Text>
              <Text style={[styles.score, { color: colors.primary }]}>
                {formatScore(exam.puntajeObtenido)}
              </Text>
            </View>
            <View style={styles.flex}>
              <Text style={{ color: colors.muted }}>Aciertos</Text>
              <Text style={[styles.score, { color: colors.text }]}>{accuracy}%</Text>
            </View>
          </View>
          {exam.psp !== null && (
            <Text
              style={[styles.note, { color: colors.muted, backgroundColor: colors.surfaceMuted }]}
            >
              Si rindieras todo el examen con este nivel, tu puntaje proyectado sería{' '}
              {formatScore(Math.round(exam.psp))}
              {maxScore !== null ? ` de ${formatScore(maxScore)}` : ''}. Es una referencia: tu
              puntaje proyectado oficial sale de los simulacros completos.
            </Text>
          )}
        </View>
      )}

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

      <View style={styles.reviewHeading}>
        <Text style={[styles.heading, { color: colors.text }]}>Revisa tus respuestas</Text>
        <Text style={[styles.reviewHint, { color: colors.muted }]}>
          {total} preguntas · Toca una para ver su respuesta y explicación.
        </Text>
      </View>
    </View>
  )

  return (
    <FlatList
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
      data={exam.preguntas}
      keyExtractor={(question) => String(question.respuestaUsuarioId)}
      extraData={expandedAnswerId}
      ListHeaderComponent={summary}
      ItemSeparatorComponent={AnswerSeparator}
      renderItem={({ item, index }) => (
        <ExamAnswerItem
          question={item}
          position={index}
          expanded={expandedAnswerId === item.respuestaUsuarioId}
          onToggle={() =>
            setExpandedAnswerId((current) =>
              current === item.respuestaUsuarioId ? null : item.respuestaUsuarioId,
            )
          }
        />
      )}
    />
  )
}

function AnswerSeparator() {
  return <View style={styles.separator} />
}

const styles = StyleSheet.create({
  content: { padding: 20 },
  summary: { gap: 14, paddingBottom: 16 },
  separator: { height: 10 },
  reviewHeading: { gap: 4, marginTop: 10 },
  reviewHint: { fontSize: 14, lineHeight: 20 },
  row: { flexDirection: 'row', gap: 10 },
  card: { gap: 8, borderRadius: 16, padding: 16 },
  score: { fontSize: 40, fontWeight: '800', fontVariant: ['tabular-nums'] },
  max: { fontSize: 20, fontWeight: '600' },
  context: { fontSize: 14, fontWeight: '700' },
  note: { borderRadius: 12, padding: 12, lineHeight: 20 },
  flex: { flex: 1 },
  heading: { fontSize: 18, fontWeight: '700' },
})
