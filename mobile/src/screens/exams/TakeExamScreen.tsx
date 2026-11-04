import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useCallback, useEffect, useState } from 'react'
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Button } from '../../components/Button'
import { Chip } from '../../components/Chip'
import { ErrorRetry } from '../../components/ErrorRetry'
import { LoadingView } from '../../components/LoadingView'
import { MathText } from '../../components/MathText'
import { OptionList } from '../../components/OptionList'
import { ProgressBar } from '../../components/ProgressBar'
import { ScratchButton } from '../../components/ScratchButton'
import { QuestionStatement } from '../../components/QuestionStatement'
import { WhiteboardModal, type ScratchStroke } from '../../components/WhiteboardModal'
import { useFetch } from '../../hooks/useFetch'
import type { RootStackParamList } from '../../navigation/types'
import { examService } from '../../services/examService'
import { useColors } from '../../theme/useColors'
import type { ExamDetail } from '../../types/exam'
import { formattedAlternative } from '../../utils/alternatives'
import { examTypeLabels } from '../../utils/examLabels'
import { formatMath } from '../../utils/formatMath'
import { notify } from '../../utils/notify'

type TakeExamScreenProps = NativeStackScreenProps<RootStackParamList, 'TakeExam'>

interface ExamInProgressProps {
  exam: ExamDetail
  onFinished: () => void
}

function ExamInProgress({ exam, onFinished }: ExamInProgressProps) {
  const colors = useColors()
  const [index, setIndex] = useState(0)
  const [changes, setChanges] = useState<Record<number, number | null>>({})
  const [finishing, setFinishing] = useState(false)
  // La pizarra de cada pregunta: solo para el postulante, vive mientras rinde el simulacro.
  const [scratch, setScratch] = useState<Record<number, ScratchStroke[]>>({})
  const [boardOpen, setBoardOpen] = useState(false)

  const total = exam.preguntas.length
  const question = exam.preguntas[index]
  const answers = exam.preguntas.map((item) =>
    item.preguntaId in changes ? changes[item.preguntaId] : item.alternativaMarcada,
  )
  const answeredCount = answers.filter((answer) => answer !== null).length

  // Se marca al instante y, si el servidor falla, se vuelve a la respuesta anterior.
  const answer = async (alternative: number | null) => {
    const previous = answers[index]
    setChanges((current) => ({ ...current, [question.preguntaId]: alternative }))
    try {
      await examService.answer(exam.id, question.preguntaId, alternative)
    } catch (error) {
      setChanges((current) => ({ ...current, [question.preguntaId]: previous }))
      notify.error(error)
    }
  }

  const finish = async () => {
    setFinishing(true)
    try {
      await examService.finish(exam.id)
      notify.success('¡Terminaste el simulacro! Este es tu resultado.')
      onFinished()
    } catch (error) {
      notify.error(error)
      setFinishing(false)
    }
  }

  const confirmFinish = () => {
    const unanswered = total - answeredCount
    Alert.alert(
      '¿Finalizar el simulacro?',
      unanswered > 0
        ? `Te faltan ${unanswered} de ${total} preguntas. Las que dejes en blanco no suman ni restan.`
        : 'Respondiste todas las preguntas.',
      [
        { text: 'Seguir respondiendo', style: 'cancel' },
        { text: 'Finalizar', style: 'destructive', onPress: finish },
      ],
    )
  }

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
    >
      <View style={styles.between}>
        <Text style={{ color: colors.muted }}>{examTypeLabels[exam.tipo]}</Text>
        <Text style={{ color: colors.muted }}>
          {answeredCount}/{total} respondidas
        </Text>
      </View>
      <ProgressBar value={answeredCount} max={total} label="Preguntas respondidas" />

      <Text style={[styles.heading, { color: colors.text }]}>
        Pregunta {index + 1} de {total}
      </Text>
      <View style={styles.between}>
        <Chip label={question.tema} />
        <ScratchButton
          hasNotes={(scratch[question.preguntaId]?.length ?? 0) > 0}
          onPress={() => setBoardOpen(true)}
        />
      </View>
      <QuestionStatement question={question} fontSize={18} />
      <OptionList
        accessibilityLabel="Alternativas"
        showLetters
        options={question.alternativas.map((text, alternative) => ({
          value: alternative,
          label: formatMath(text),
          content: (
            <MathText
              text={formattedAlternative(question.presentacion?.alternativas, alternative)}
              fallback={text}
            />
          ),
        }))}
        selected={answers[index]}
        onSelect={answer}
      />

      <View style={styles.row}>
        <View style={styles.flex}>
          <Button
            title="Anterior"
            variant="secondary"
            disabled={index === 0}
            onPress={() => setIndex(index - 1)}
          />
        </View>
        <View style={styles.flex}>
          <Button
            title="Siguiente"
            disabled={index === total - 1}
            onPress={() => setIndex(index + 1)}
          />
        </View>
      </View>
      <Button
        title="Dejar en blanco"
        variant="secondary"
        disabled={answers[index] === null}
        onPress={() => answer(null)}
      />
      <View style={[styles.finishSection, { borderTopColor: colors.border }]}>
        <Text style={[styles.finishHint, { color: colors.muted }]}>
          Finaliza cuando hayas revisado tus respuestas.
        </Text>
        {/* En la última pregunta ya no hay "Siguiente": finalizar pasa a ser la acción principal. */}
        <Button
          title="Finalizar simulacro"
          variant={index === total - 1 ? 'primary' : 'secondary'}
          loading={finishing}
          onPress={confirmFinish}
        />
      </View>
      <WhiteboardModal
        key={question.preguntaId}
        visible={boardOpen}
        statement={question.enunciado}
        initialStrokes={scratch[question.preguntaId] ?? []}
        onClose={(strokes) => {
          setScratch((current) => ({ ...current, [question.preguntaId]: strokes }))
          setBoardOpen(false)
        }}
      />
    </ScrollView>
  )
}

export default function TakeExamScreen({ navigation, route }: TakeExamScreenProps) {
  const { examId } = route.params
  const fetchExam = useCallback(
    (signal: AbortSignal) => examService.getDetail(examId, signal),
    [examId],
  )
  const { data: exam, error, loading, retry } = useFetch(fetchExam)
  const finished = exam?.estado === 'FINALIZADO'

  const showResult = useCallback(
    () => navigation.replace('ExamResult', { examId }),
    [navigation, examId],
  )

  useEffect(() => {
    if (finished) showResult()
  }, [finished, showResult])

  if (loading || finished) return <LoadingView />
  if (error || !exam) {
    return (
      <View style={styles.content}>
        <ErrorRetry message={error?.message ?? 'No pudimos abrir el simulacro.'} onRetry={retry} />
      </View>
    )
  }
  if (exam.preguntas.length === 0) {
    return (
      <View style={styles.content}>
        <ErrorRetry message="Este simulacro no tiene preguntas." onRetry={retry} />
      </View>
    )
  }
  return <ExamInProgress exam={exam} onFinished={showResult} />
}

const styles = StyleSheet.create({
  content: { gap: 14, padding: 20 },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  row: { flexDirection: 'row', gap: 12 },
  flex: { flex: 1 },
  heading: { fontSize: 20, fontWeight: '700' },
  finishSection: { borderTopWidth: 1, marginTop: 10, paddingTop: 20, gap: 10 },
  finishHint: { fontSize: 14, lineHeight: 20 },
})
