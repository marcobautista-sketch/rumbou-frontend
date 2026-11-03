import { Ionicons } from '@expo/vector-icons'
import { useCallback, useState } from 'react'
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native'
import { AnswerReview } from '../components/AnswerReview'
import { Button } from '../components/Button'
import { Chip } from '../components/Chip'
import { ErrorRetry } from '../components/ErrorRetry'
import { MathText } from '../components/MathText'
import { OptionList } from '../components/OptionList'
import { ProgressBar } from '../components/ProgressBar'
import { QuestionExplanation } from '../components/QuestionExplanation'
import { QuestionStatement } from '../components/QuestionStatement'
import { SolutionPhotoReview } from '../components/SolutionPhotoReview'
import { StatCard } from '../components/StatCard'
import { useFetch } from '../hooks/useFetch'
import { challengeService } from '../services/challengeService'
import { tutorService } from '../services/tutorService'
import { userService } from '../services/userService'
import { ScratchButton } from '../components/ScratchButton'
import { WhiteboardModal, type ScratchStroke } from '../components/WhiteboardModal'
import { useColors } from '../theme/useColors'
import type { DailyChallenge } from '../types/challenge'
import { formattedAlternative } from '../utils/alternatives'
import { formatDays } from '../utils/format'
import { formatMath } from '../utils/formatMath'
import { notify } from '../utils/notify'

function TutorExplanation({ challenge }: { challenge: DailyChallenge }) {
  const colors = useColors()
  const [explanation, setExplanation] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const ask = async () => {
    setLoading(true)
    try {
      setExplanation(await tutorService.explain(challenge.preguntaId, challenge.alternativaMarcada))
    } catch (error) {
      notify.error(error)
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
      <QuestionStatement question={challenge} fontSize={18} />
      {challenge.claveCorrecta !== null && (
        <AnswerReview
          alternatives={challenge.alternativas}
          formatted={challenge.presentacion?.alternativas}
          correct={challenge.claveCorrecta}
          marked={challenge.alternativaMarcada}
        />
      )}
      <QuestionExplanation explanation={challenge.explicacion} steps={challenge.pasos} />
      {!correct && <TutorExplanation challenge={challenge} />}
      <SolutionPhotoReview questionId={challenge.preguntaId} />
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
  // Pizarra para resolver el desafío: solo para el postulante, se descarta al responder.
  const [scratch, setScratch] = useState<ScratchStroke[]>([])
  const [boardOpen, setBoardOpen] = useState(false)
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
          value={gamification.data ? formatDays(gamification.data.rachaActual) : '–'}
          label="Racha"
        />
        <StatCard
          icon="star"
          value={`${gamification.data?.xpSemanal ?? '–'} XP`}
          label="Esta semana"
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
              <Chip label={current.tema} />
              <Chip label={`5 min · +${current.xpPorAcierto} XP`} tone="accent" />
            </View>
            <View style={styles.end}>
              <ScratchButton hasNotes={scratch.length > 0} onPress={() => setBoardOpen(true)} />
            </View>
            <QuestionStatement question={current} fontSize={18} />
            <OptionList
              accessibilityLabel="Alternativas"
              showLetters
              options={current.alternativas.map((text, index) => ({
                value: index,
                label: formatMath(text),
                content: (
                  <MathText
                    text={formattedAlternative(current.presentacion?.alternativas, index)}
                    fallback={text}
                  />
                ),
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
            <WhiteboardModal
              visible={boardOpen}
              statement={current.enunciado}
              initialStrokes={scratch}
              onClose={(strokes) => {
                setScratch(strokes)
                setBoardOpen(false)
              }}
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
  cardTitle: { fontSize: 16, fontWeight: '600' },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  centered: { textAlign: 'center' },
  end: { alignItems: 'flex-end' },
  section: { gap: 14 },
  verdict: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 16, padding: 16 },
  verdictTitle: { fontSize: 20, fontWeight: '700' },
  flex: { flex: 1 },
  note: { gap: 4, borderRadius: 12, padding: 14 },
  noteTitle: { fontWeight: '700' },
})
