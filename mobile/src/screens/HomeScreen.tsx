import { Ionicons } from '@expo/vector-icons'
import { useCallback, type ComponentProps } from 'react'
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Button } from '../components/Button'
import { ErrorRetry } from '../components/ErrorRetry'
import { StatCard } from '../components/StatCard'
import { useAuth } from '../hooks/useAuth'
import { useFetch } from '../hooks/useFetch'
import type { MainTabScreenProps } from '../navigation/types'
import { examService } from '../services/examService'
import { userService } from '../services/userService'
import { useColors } from '../theme/useColors'
import type { ExamSummary } from '../types/exam'
import { examTypeLabels, formatExamDate, formatScore } from '../utils/examLabels'

type HomeScreenProps = MainTabScreenProps<'Home'>
type IconName = ComponentProps<typeof Ionicons>['name']

function Shortcut({
  icon,
  title,
  description,
  onPress,
}: {
  icon: IconName
  title: string
  description: string
  onPress: () => void
}) {
  const colors = useColors()
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        styles.shortcut,
        { backgroundColor: colors.surface, opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <View style={[styles.shortcutIcon, { backgroundColor: colors.accentSoft }]}>
        <Ionicons name={icon} size={22} color={colors.accentText} />
      </View>
      <View style={styles.flex}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>{title}</Text>
        <Text style={{ color: colors.muted }}>{description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.muted} />
    </Pressable>
  )
}

// El backend lista los simulacros del más reciente al más antiguo: basta con la primera página.
function pickHighlights(exams: ExamSummary[]) {
  return {
    inProgress: exams.find((exam) => exam.estado === 'EN_CURSO') ?? null,
    lastFinished: exams.find((exam) => exam.estado === 'FINALIZADO') ?? null,
  }
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const colors = useColors()
  const { top } = useSafeAreaInsets()
  const { user } = useAuth()
  const fetchGamification = useCallback(
    (signal: AbortSignal) => userService.getGamification(signal),
    [],
  )
  const fetchExams = useCallback((signal: AbortSignal) => examService.list(0, 10, signal), [])
  const gamification = useFetch(fetchGamification)
  const exams = useFetch(fetchExams)

  const { inProgress, lastFinished } = pickHighlights(exams.data?.content ?? [])
  const refreshing = gamification.loading || exams.loading
  const refresh = () => {
    gamification.retry()
    exams.retry()
  }

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[styles.content, { paddingTop: top + 20 }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
    >
      <View>
        <Text style={[styles.brand, { color: colors.primary }]}>RumboU</Text>
        <Text style={[styles.greeting, { color: colors.text }]}>Hola, {user?.nombre}</Text>
        <Text style={{ color: colors.muted }}>Sigue sumando cada día hacia tu ingreso.</Text>
      </View>

      <View style={styles.row}>
        <StatCard
          icon="flame"
          value={gamification.data ? `${gamification.data.rachaActual} días` : '–'}
          label="RACHA"
        />
        <StatCard
          icon="star"
          value={gamification.data ? `${gamification.data.xpSemanal} XP` : '–'}
          label="ESTA SEMANA"
        />
      </View>

      {exams.error ? (
        <ErrorRetry message={exams.error.message} onRetry={exams.retry} />
      ) : inProgress ? (
        <View style={[styles.card, { backgroundColor: colors.accentSoft }]}>
          <Text style={[styles.cardLabel, { color: colors.accentText }]}>TIENES UNO A MEDIAS</Text>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            {examTypeLabels[inProgress.tipo]}
          </Text>
          <Text style={{ color: colors.muted }}>{inProgress.area}</Text>
          <Button
            title="Continuar simulacro"
            onPress={() => navigation.navigate('TakeExam', { examId: inProgress.id })}
          />
        </View>
      ) : lastFinished ? (
        <Pressable
          accessibilityRole="button"
          accessibilityHint="Abre el resultado"
          onPress={() => navigation.navigate('ExamResult', { examId: lastFinished.id })}
          style={({ pressed }) => [
            styles.card,
            { backgroundColor: colors.surface, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Text style={[styles.cardLabel, { color: colors.muted }]}>TU ÚLTIMO RESULTADO</Text>
          <Text style={[styles.score, { color: colors.primary }]}>
            {formatScore(lastFinished.puntajeObtenido)}
          </Text>
          <Text style={{ color: colors.muted }}>
            {examTypeLabels[lastFinished.tipo]} · {formatExamDate(lastFinished.fechaInicio)}
          </Text>
        </Pressable>
      ) : (
        !exams.loading && (
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Mide tu punto de partida</Text>
            <Text style={{ color: colors.muted }}>
              Rinde tu primer simulacro y te diremos qué temas reforzar.
            </Text>
          </View>
        )
      )}

      <Button title="Rendir un simulacro" onPress={() => navigation.navigate('NewExam')} />

      <Text style={[styles.section, { color: colors.text }]}>Sigue practicando</Text>
      <Shortcut
        icon="flash-outline"
        title="Desafío de hoy"
        description="Una pregunta al día para no perder la racha."
        onPress={() => navigation.navigate('Challenge')}
      />
      <Shortcut
        icon="mic-outline"
        title="Asistente RumboU"
        description="Pregúntale por voz o por texto."
        onPress={() => navigation.navigate('Assistant')}
      />
      <Shortcut
        icon="library-outline"
        title="Mi plan de estudio"
        description="Videos y libros de tus temas más débiles."
        onPress={() => navigation.navigate('StudyPlan')}
      />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  content: { gap: 14, padding: 20 },
  brand: { fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
  greeting: { fontSize: 28, fontWeight: '700' },
  row: { flexDirection: 'row', gap: 12 },
  flex: { flex: 1 },
  card: { gap: 8, borderRadius: 16, padding: 16 },
  cardLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  cardTitle: { fontSize: 17, fontWeight: '700' },
  score: { fontSize: 36, fontWeight: '700' },
  section: { fontSize: 18, fontWeight: '700', marginTop: 6 },
  shortcut: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  shortcutIcon: { borderRadius: 12, padding: 10 },
})
