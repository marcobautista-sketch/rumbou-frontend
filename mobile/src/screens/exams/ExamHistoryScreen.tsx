import { Ionicons } from '@expo/vector-icons'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useCallback, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { Button } from '../../components/Button'
import { ErrorRetry } from '../../components/ErrorRetry'
import { useFetch } from '../../hooks/useFetch'
import type { RootStackParamList } from '../../navigation/types'
import { examService } from '../../services/examService'
import { useColors } from '../../theme/useColors'
import type { ExamSummary } from '../../types/exam'
import { examTypeLabels, formatExamDate, formatScore } from '../../utils/examLabels'

type ExamHistoryScreenProps = NativeStackScreenProps<RootStackParamList, 'ExamHistory'>

const PAGE_SIZE = 10

function ExamItem({ exam, onPress }: { exam: ExamSummary; onPress: () => void }) {
  const colors = useColors()
  const finished = exam.estado === 'FINALIZADO'

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint={finished ? 'Abre el resultado' : 'Continúa el simulacro'}
      onPress={onPress}
      style={({ pressed }) => [
        styles.item,
        { backgroundColor: colors.surface, opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <View style={styles.flex}>
        <Text style={[styles.title, { color: colors.text }]}>{examTypeLabels[exam.tipo]}</Text>
        <Text style={{ color: colors.muted }}>{exam.area}</Text>
        <Text style={{ color: colors.muted }}>{formatExamDate(exam.fechaInicio)}</Text>
      </View>
      <View style={styles.side}>
        <Text
          style={[
            styles.status,
            finished
              ? { backgroundColor: colors.successSoft, color: colors.success }
              : { backgroundColor: colors.accentSoft, color: colors.accentText },
          ]}
        >
          {finished ? 'Terminado' : 'En curso'}
        </Text>
        {finished && (
          <Text style={[styles.title, { color: colors.primary }]}>
            {formatScore(exam.puntajeObtenido)}
          </Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.muted} />
    </Pressable>
  )
}

export default function ExamHistoryScreen({ navigation }: ExamHistoryScreenProps) {
  const colors = useColors()
  const [page, setPage] = useState(0)
  const fetchExams = useCallback(
    (signal: AbortSignal) => examService.list(page, PAGE_SIZE, signal),
    [page],
  )
  const exams = useFetch(fetchExams)
  const result = exams.data

  const open = (exam: ExamSummary) =>
    exam.estado === 'FINALIZADO'
      ? navigation.navigate('ExamResult', { examId: exam.id })
      : navigation.navigate('TakeExam', { examId: exam.id })

  if (exams.loading && !result) {
    return (
      <View style={[styles.centeredView, { backgroundColor: colors.background }]}>
        <ActivityIndicator
          size="large"
          color={colors.primary}
          accessibilityLabel="Cargando simulacros"
        />
      </View>
    )
  }
  if (exams.error) {
    return (
      <View style={[styles.content, { backgroundColor: colors.background }]}>
        <ErrorRetry message={exams.error.message} onRetry={exams.retry} />
      </View>
    )
  }
  if (!result || result.totalElements === 0) {
    return (
      <View style={[styles.empty, { backgroundColor: colors.background }]}>
        <Ionicons name="document-text-outline" size={48} color={colors.muted} />
        <Text style={[styles.title, { color: colors.text }]}>Aún no rindes simulacros</Text>
        <Text style={[styles.centered, { color: colors.muted }]}>
          Rinde tu primer simulacro para ver aquí tu avance.
        </Text>
        <Button title="Rendir mi primer simulacro" onPress={() => navigation.navigate('NewExam')} />
      </View>
    )
  }

  const pager = (
    <View style={styles.pager}>
      <View style={styles.flex}>
        <Button
          title="Anterior"
          variant="secondary"
          disabled={result.first || exams.loading}
          onPress={() => setPage(page - 1)}
        />
      </View>
      <Text style={{ color: colors.muted }}>
        Página {page + 1} de {result.totalPages}
      </Text>
      <View style={styles.flex}>
        <Button
          title="Siguiente"
          variant="secondary"
          disabled={result.last || exams.loading}
          onPress={() => setPage(page + 1)}
        />
      </View>
    </View>
  )

  return (
    <FlatList
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
      data={result.content}
      keyExtractor={(exam) => String(exam.id)}
      renderItem={({ item }) => <ExamItem exam={item} onPress={() => open(item)} />}
      ListHeaderComponent={
        <Text style={{ color: colors.muted }}>
          {result.totalElements} {result.totalElements === 1 ? 'simulacro' : 'simulacros'} en total
        </Text>
      }
      ListFooterComponent={pager}
      refreshControl={<RefreshControl refreshing={exams.loading} onRefresh={exams.retry} />}
    />
  )
}

const styles = StyleSheet.create({
  content: { gap: 10, padding: 20 },
  centeredView: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 16, padding: 16 },
  flex: { flex: 1, gap: 2 },
  side: { alignItems: 'flex-end', gap: 6 },
  title: { fontSize: 16, fontWeight: '700' },
  status: {
    overflow: 'hidden',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 2,
    fontSize: 12,
    fontWeight: '700',
  },
  pager: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 6 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 24 },
  centered: { textAlign: 'center' },
})
