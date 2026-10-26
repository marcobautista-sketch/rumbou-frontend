import { Ionicons } from '@expo/vector-icons'
import { useCallback, useState } from 'react'
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native'
import { AnswerReview } from '../components/AnswerReview'
import { Button } from '../components/Button'
import { ErrorRetry } from '../components/ErrorRetry'
import { OptionList } from '../components/OptionList'
import { ProgressBar } from '../components/ProgressBar'
import { SolutionPhotoReview } from '../components/SolutionPhotoReview'
import { useFetch } from '../hooks/useFetch'
import { toApiError } from '../services/apiError'
import { challengeService } from '../services/challengeService'
import { tutorService } from '../services/tutorService'
import { userService } from '../services/userService'
import { useColors } from '../theme/useColors'
import type { DailyChallenge } from '../types/challenge'
import { formatMath } from '../utils/formatMath'
import { notify } from '../utils/notify'

function StatCard({
  icon,
  value,
  label,
}: {
  icon: 'flame' | 'star'
  value: string
  label: string
}) {
  const colors = useColors()
  return (
    <View style={[styles.card, styles.stat, { backgroundColor: colors.surface }]}>
      <Ionicons name={icon} size={26} color={colors.accentText} />
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.muted }]}>{label}</Text>
    </View>
  )
}

function TutorExplanation({ challenge }: { challenge: DailyChallenge }) {
  const colors = useColors()
  const [explanation, setExplanation] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const ask = async () => {
    setLoading(true)
    try {
      setExplanation(await tutorService.explain(challenge.preguntaId, challenge.alternativaMarcada))
    } catch (error) {
      notify.error(toApiError(error))
    } finally {
      setLoading(false)
    }
  }

  return explanation ? (
    <View style={[styles.note, { backgroundColor: colors.accentSoft }]}>
      <Text style={[styles.noteTitle, { color: colors.text }]}>Tutor IA</Text>
      <Text style={{ color: colors.text }}>{formatMath(explanation)}</Text>
    </View>
  ) : (
    <Button
      title="¿Por qué me equivoqué? Pregúntale al tutor"
      variant="secondary"
      loading={loading}
      onPress={ask}
    />
  )
}

function ChallengeResult({ challenge }: { challenge: DailyChallenge }) {
  const colors = useColors()
  const correct = challenge.esCorrecta === true

  return (
    <View style={styles.section}>
      <View
        accessibilityRole="summary"
        style={[
          styles.verdict,
          { backgroundColor: correct ? colors.successSoft : colors.dangerSoft },
        ]}
      >
        <Ionicons
          name={correct ? 'checkmark-circle' : 'close-circle'}
          size={40}
          color={correct ? colors.success : colors.danger}
        />
        <View style={styles.flex}>
          <Text style={[styles.verdictTitle, { color: colors.text }]}>
            {correct ? '¡Correcto!' : 'Esta vez no fue'}
          </Text>
          <Text style={{ color: colors.muted }}>
            Ganaste {challenge.xpGanado} XP{correct ? '' : ' por intentarlo'}.
          </Text>
        </View>
      </View>
      <Text style={[styles.question, { color: colors.text }]}>
        {formatMath(challenge.enunciado)}
      </Text>
      {challenge.claveCorrecta !== null && (
        <AnswerReview
          alternatives={challenge.alternativas}
          correct={challenge.claveCorrecta}
          marked={challenge.alternativaMarcada}
        />
      )}
      {challenge.explicacion && (
        <View style={[styles.note, { backgroundColor: colors.surfaceMuted }]}>
          <Text style={[styles.noteTitle, { color: colors.text }]}>Explicación</Text>
          <Text style={{ color: colors.muted }}>{formatMath(challenge.explicacion)}</Text>
        </View>
      )}
      {!correct && <TutorExplanation challenge={challenge} />}
      <SolutionPhotoReview questionId={challenge.preguntaId} statement={challenge.enunciado} />
      <Text style={[styles.centered, { color: colors.muted }]}>
        Vuelve mañana por un nuevo desafío.
      </Text>
    </View>
  )
}

export default function ChallengeScreen() {
  const colors = useColors()
  const fetchChallenge = useCallback((signal: AbortSignal) => challengeService.getToday(signal), [])
  const fetchGamification = useCallback(
    (signal: AbortSignal) => userService.getGamification(signal),
    [],
  )
  const challenge = useFetch(fetchChallenge)
  const gamification = useFetch(fetchGamification)
  const [answered, setAnswered] = useState<DailyChallenge | null>(null)
  const [selected, setSelected] = useState<number | null>(null)
  const [sending, setSending] = useState(false)
  const current = answered ?? challenge.data
  const done = current?.desafiosDeLaSemana ?? 0
  const goal = current?.metaSemanal ?? 5
  const missing = Math.max(0, goal - done)

  const submit = async () => {
    if (selected === null) return
    setSending(true)
    try {
      const result = await challengeService.answer(selected)
      setAnswered(result)
      gamification.retry()
      notify.success(
        result.esCorrecta
          ? `¡Correcto! +${result.xpGanado} XP`
          : `+${result.xpGanado} XP por intentarlo`,
      )
    } catch (error) {
      notify.error(error)
    } finally {
      setSending(false)
    }
  }

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
    >
      <View style={styles.row}>
        <StatCard
          icon="flame"
          value={`${gamification.data?.rachaActual ?? '–'} días`}
          label="RACHA DIARIA"
        />
        <StatCard
          icon="star"
          value={`${gamification.data?.xpSemanal ?? '–'} XP`}
          label="ESTA SEMANA"
        />
      </View>
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <View style={styles.between}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Progreso semanal</Text>
          <Text style={[styles.cardTitle, { color: colors.accentText }]}>
            {Math.round((done / goal) * 100)}%
          </Text>
        </View>
        <ProgressBar value={done} max={goal} label="Desafíos de la semana" />
        <Text style={[styles.centered, { color: colors.muted }]}>
          {missing > 0
            ? `Faltan ${missing} ${missing === 1 ? 'desafío' : 'desafíos'} para el bono semanal`
            : '¡Conseguiste el bono semanal!'}
        </Text>
      </View>

      {challenge.loading && !current ? (
        <ActivityIndicator
          size="large"
          color={colors.primary}
          accessibilityLabel="Cargando el desafío"
        />
      ) : challenge.error && !current ? (
        <ErrorRetry message={challenge.error.message} onRetry={challenge.retry} />
      ) : current?.respondido ? (
        <ChallengeResult challenge={current} />
      ) : (
        current && (
          <View style={styles.section}>
            <View style={styles.between}>
              <Text style={[styles.chip, { backgroundColor: colors.chip, color: colors.primary }]}>
                {current.tema}
              </Text>
              <Text
                style={[styles.chip, { backgroundColor: colors.accentSoft, color: colors.text }]}
              >
                5 min · +{current.xpPorAcierto} XP
              </Text>
            </View>
            <Text style={[styles.question, { color: colors.text }]}>
              {formatMath(current.enunciado)}
            </Text>
            <OptionList
              accessibilityLabel="Alternativas"
              showLetters
              options={current.alternativas.map((text, index) => ({
                value: index,
                label: formatMath(text),
              }))}
              selected={selected}
              onSelect={setSelected}
            />
            <Button
              title="Responder desafío"
              disabled={selected === null}
              loading={sending}
              onPress={submit}
            />
          </View>
        )
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  content: { gap: 16, padding: 20 },
  row: { flexDirection: 'row', gap: 12 },
  card: { gap: 10, borderRadius: 16, padding: 16 },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: '700' },
  statLabel: { fontSize: 12, fontWeight: '600', letterSpacing: 0.5 },
  cardTitle: { fontSize: 16, fontWeight: '600' },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  centered: { textAlign: 'center' },
  section: { gap: 14 },
  chip: {
    overflow: 'hidden',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
    fontWeight: '600',
  },
  question: { fontSize: 18, lineHeight: 26 },
  verdict: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 16, padding: 16 },
  verdictTitle: { fontSize: 20, fontWeight: '700' },
  flex: { flex: 1 },
  note: { gap: 4, borderRadius: 12, padding: 14 },
  noteTitle: { fontWeight: '700' },
})
