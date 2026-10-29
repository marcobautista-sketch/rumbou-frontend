import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useCallback, useEffect, useState } from 'react'
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Button } from '../../components/Button'
import { ErrorRetry } from '../../components/ErrorRetry'
import { LoadingView } from '../../components/LoadingView'
import { OptionList } from '../../components/OptionList'
import { ProgressBar } from '../../components/ProgressBar'
import { useFetch } from '../../hooks/useFetch'
import type { RootStackParamList } from '../../navigation/types'
import { examService } from '../../services/examService'
import { useColors } from '../../theme/useColors'
import type { ExamDetail } from '../../types/exam'
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
      <Text style={[styles.chip, { backgroundColor: colors.chip, color: colors.primary }]}>
        {question.tema}
      </Text>
      <Text style={[styles.question, { color: colors.text }]}>
        {formatMath(question.enunciado)}
      </Text>
      <OptionList
        accessibilityLabel="Alternativas"
        showLetters
        options={question.alternativas.map((text, alternative) => ({
          value: alternative,
          label: formatMath(text),
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
      <Button title="Finalizar simulacro" loading={finishing} onPress={confirmFinish} />
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
  between: { flexDirection: 'row', justifyContent: 'space-between' },
  row: { flexDirection: 'row', gap: 12 },
  flex: { flex: 1 },
  heading: { fontSize: 20, fontWeight: '700' },
  chip: {
    alignSelf: 'flex-start',
    overflow: 'hidden',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
    fontWeight: '600',
  },
  question: { fontSize: 18, lineHeight: 26 },
})
