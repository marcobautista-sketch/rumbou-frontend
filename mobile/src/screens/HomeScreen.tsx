import { Ionicons } from '@expo/vector-icons'
import { useCallback, useMemo, type ComponentProps } from 'react'
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { BrandMark } from '../components/BrandMark'
import { ErrorRetry } from '../components/ErrorRetry'
import { GoalSummary } from '../components/GoalSummary'
import { useAuth } from '../hooks/useAuth'
import { useFetch } from '../hooks/useFetch'
import type { MainTabScreenProps } from '../navigation/types'
import { areaService } from '../services/areaService'
import { examService } from '../services/examService'
import { goalService } from '../services/goalService'
import { userService } from '../services/userService'
import { useColors } from '../theme/useColors'
import { examTypeLabels, formatExamDate } from '../utils/examLabels'
import { daysUntil, formatDays } from '../utils/format'
import { universityShort } from '../utils/universityLabels'

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
      <View style={[styles.shortcutIcon, { backgroundColor: colors.chip }]}>
        <Ionicons name={icon} size={22} color={colors.primary} />
      </View>
      <View style={styles.flex}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>{title}</Text>
        <Text style={{ color: colors.muted }}>{description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.muted} />
    </Pressable>
  )
}

function Stat({
  icon,
  color,
  label,
  value,
  hint,
}: {
  icon: IconName
  color: string
  label: string
  value: string
  hint?: string
}) {
  const colors = useColors()
  return (
    <View
      accessible
      accessibilityLabel={`${label}: ${value}`}
      style={[styles.card, styles.stat, { backgroundColor: colors.surface }]}
    >
      <Ionicons name={icon} size={20} color={color} />
      <Text style={[styles.statLabel, { color: colors.muted }]}>{label}</Text>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      {hint && <Text style={[styles.statHint, { color: colors.muted }]}>{hint}</Text>}
    </View>
  )
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
  const fetchGoals = useCallback((signal: AbortSignal) => goalService.list(signal), [])
  const fetchAreas = useCallback((signal: AbortSignal) => areaService.list(signal), [])
  const gamification = useFetch(fetchGamification)
  const exams = useFetch(fetchExams)
  const goals = useFetch(fetchGoals)
  const areas = useFetch(fetchAreas)

  const goal = goals.data?.[0] ?? null
  const area = areas.data?.find((candidate) => candidate.id === goal?.areaId) ?? null
  const examDays = area?.fechaProximoExamen ? daysUntil(area.fechaProximoExamen) : null
  // El backend lista los simulacros del más reciente al más antiguo: basta con la primera página.
  const recent = useMemo(() => exams.data?.content ?? [], [exams.data])
  const inProgress = recent.find((exam) => exam.estado === 'EN_CURSO') ?? null
  const hasFinished = recent.some((exam) => exam.estado === 'FINALIZADO')

  const refreshing = gamification.loading || exams.loading || goals.loading
  const refresh = () => {
    gamification.retry()
    exams.retry()
    goals.retry()
  }

  // Lo más útil que puede hacer ahora, en el mismo orden que la web.
  const nextStep = !goal
    ? {
        icon: 'flag' as IconName,
        title: 'Elige tu carrera meta',
        text: 'Así comparamos cada simulacro con el puntaje del último ingresante.',
        action: 'Elegir carrera',
        onPress: () => navigation.navigate('Goals'),
      }
    : inProgress
      ? {
          icon: 'play' as IconName,
          title: `Termina tu ${examTypeLabels[inProgress.tipo].toLowerCase()}`,
          text: `Lo empezaste el ${formatExamDate(inProgress.fechaInicio)}. Tus respuestas están guardadas.`,
          action: 'Continuar',
          onPress: () => navigation.navigate('TakeExam', { examId: inProgress.id }),
        }
      : !hasFinished
        ? {
            icon: 'locate' as IconName,
            title: 'Rinde tu diagnóstico',
            text: 'Un simulacro completo mide tu punto de partida en cada tema del examen.',
            action: 'Empezar',
            onPress: () => navigation.navigate('NewExam'),
          }
        : {
            icon: 'document-text' as IconName,
            title: 'Practica por tema',
            text: 'Los simulacros por tema son la forma más rápida de subir tu puntaje proyectado.',
            action: 'Elegir tema',
            onPress: () => navigation.navigate('NewExam'),
          }

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[styles.content, { paddingTop: top + 16 }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
    >
      <BrandMark size={30} />
      <View style={styles.greeting}>
        <Text accessibilityRole="header" style={[styles.hello, { color: colors.text }]}>
          Hola, {user?.nombre}
        </Text>
        <Text style={{ color: colors.muted }}>
          {area && examDays !== null && examDays > 0
            ? `Faltan ${formatDays(examDays)} para el examen de admisión de ${
                area.universidad === 'UNI' ? 'la UNI' : universityShort(area.universidad)
              }.`
            : 'Tu rumbo hacia la universidad, en un solo lugar.'}
        </Text>
      </View>

      {goals.error ? (
        <ErrorRetry message={goals.error.message} onRetry={goals.retry} />
      ) : (
        goal && (
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <Text style={[styles.cardLabel, { color: colors.muted }]}>Tu meta</Text>
            <GoalSummary goal={goal} />
          </View>
        )
      )}

      {exams.error ? (
        <ErrorRetry message={exams.error.message} onRetry={exams.retry} />
      ) : (
        !goals.loading &&
        !exams.loading && (
          <View style={[styles.card, styles.nextStep, { backgroundColor: colors.primary }]}>
            <View style={styles.nextStepHeader}>
              <Ionicons name={nextStep.icon} size={20} color={colors.onPrimary} />
              <Text style={[styles.cardLabel, { color: colors.onPrimary, opacity: 0.85 }]}>
                Tu siguiente paso
              </Text>
            </View>
            <Text style={[styles.nextStepTitle, { color: colors.onPrimary }]}>
              {nextStep.title}
            </Text>
            <Text style={{ color: colors.onPrimary, opacity: 0.9 }}>{nextStep.text}</Text>
            <Pressable
              accessibilityRole="button"
              onPress={nextStep.onPress}
              style={({ pressed }) => [
                styles.nextStepButton,
                { backgroundColor: colors.onPrimary, opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <Text style={[styles.nextStepAction, { color: colors.primary }]}>
                {nextStep.action}
              </Text>
              <Ionicons name="arrow-forward" size={18} color={colors.primary} />
            </Pressable>
          </View>
        )
      )}

      <View style={styles.row}>
        <Stat
          icon="flame"
          color={colors.warning}
          label="Racha"
          value={gamification.data ? formatDays(gamification.data.rachaActual) : '–'}
          hint={
            gamification.data ? `Mejor: ${formatDays(gamification.data.rachaMaxima)}` : undefined
          }
        />
        <Stat
          icon="star"
          color={colors.primary}
          label="Esta semana"
          value={gamification.data ? `${gamification.data.xpSemanal} XP` : '–'}
          hint={gamification.data ? `${gamification.data.xpTotal} XP en total` : undefined}
        />
      </View>

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
  content: { gap: 14, padding: 20, paddingBottom: 32 },
  greeting: { gap: 4, marginTop: 6 },
  hello: { fontSize: 28, fontWeight: '800' },
  row: { flexDirection: 'row', gap: 12 },
  flex: { flex: 1 },
  card: { gap: 8, borderRadius: 16, padding: 16 },
  cardLabel: { fontSize: 13, fontWeight: '700' },
  cardTitle: { fontSize: 17, fontWeight: '700' },
  nextStep: { gap: 6, padding: 18 },
  nextStepHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  nextStepTitle: { fontSize: 20, fontWeight: '800' },
  nextStepButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    marginTop: 8,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  nextStepAction: { fontSize: 16, fontWeight: '700' },
  stat: { flex: 1, gap: 2 },
  statLabel: { fontSize: 13, marginTop: 4 },
  statValue: { fontSize: 22, fontWeight: '800' },
  statHint: { fontSize: 12 },
  section: { fontSize: 18, fontWeight: '800', marginTop: 6 },
  shortcut: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  shortcutIcon: { borderRadius: 12, padding: 10 },
})
