import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useCallback, useState } from 'react'
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Button } from '../../components/Button'
import { ErrorRetry } from '../../components/ErrorRetry'
import { OptionList } from '../../components/OptionList'
import { useFetch } from '../../hooks/useFetch'
import type { RootStackParamList } from '../../navigation/types'
import { areaService } from '../../services/areaService'
import { examService } from '../../services/examService'
import { useColors } from '../../theme/useColors'
import type { ExamType, Topic } from '../../types/exam'
import { notify } from '../../utils/notify'

type NewExamScreenProps = NativeStackScreenProps<RootStackParamList, 'NewExam'>

const examTypes: { value: ExamType; label: string }[] = [
  { value: 'POR_TEMA', label: 'Por tema: practica un solo tema' },
  { value: 'COMPLETO', label: 'Completo: el examen entero con su puntaje' },
  { value: 'DIAGNOSTICO', label: 'Diagnóstico: mide tu punto de partida' },
]

const noTopics: Topic[] = []

export default function NewExamScreen({ navigation }: NewExamScreenProps) {
  const colors = useColors()
  const [areaId, setAreaId] = useState<number | null>(null)
  const [type, setType] = useState<ExamType>('POR_TEMA')
  const [topicId, setTopicId] = useState<number | null>(null)
  const [starting, setStarting] = useState(false)

  const fetchAreas = useCallback((signal: AbortSignal) => areaService.list(signal), [])
  const fetchTopics = useCallback(
    (signal: AbortSignal) =>
      areaId ? areaService.listTopics(areaId, signal) : Promise.resolve(noTopics),
    [areaId],
  )
  const areas = useFetch(fetchAreas)
  const topics = useFetch(fetchTopics)

  const needsTopic = type === 'POR_TEMA'
  const ready = areaId !== null && (!needsTopic || topicId !== null)

  const chooseArea = (id: number) => {
    setAreaId(id)
    setTopicId(null)
  }

  const start = async () => {
    if (!ready || areaId === null) return
    setStarting(true)
    try {
      const examId = await examService.start({
        areaId,
        tipo: type,
        temaId: needsTopic && topicId !== null ? topicId : undefined,
      })
      navigation.replace('TakeExam', { examId })
    } catch (error) {
      notify.error(error)
      setStarting(false)
    }
  }

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.heading, { color: colors.text }]}>Universidad y área</Text>
      {areas.loading ? (
        <ActivityIndicator color={colors.primary} accessibilityLabel="Cargando áreas" />
      ) : areas.error ? (
        <ErrorRetry message={areas.error.message} onRetry={areas.retry} />
      ) : (
        <OptionList
          accessibilityLabel="Universidad y área"
          options={(areas.data ?? []).map((area) => ({
            value: area.id,
            label: `${area.universidad} · ${area.nombre}`,
          }))}
          selected={areaId}
          onSelect={chooseArea}
        />
      )}

      <Text style={[styles.heading, { color: colors.text }]}>Tipo de simulacro</Text>
      <OptionList
        accessibilityLabel="Tipo de simulacro"
        options={examTypes}
        selected={type}
        onSelect={setType}
      />

      {needsTopic && (
        <View style={styles.section}>
          <Text style={[styles.heading, { color: colors.text }]}>Tema</Text>
          {areaId === null ? (
            <Text style={{ color: colors.muted }}>Primero elige tu universidad y área.</Text>
          ) : topics.loading ? (
            <ActivityIndicator color={colors.primary} accessibilityLabel="Cargando temas" />
          ) : topics.error ? (
            <ErrorRetry message={topics.error.message} onRetry={topics.retry} />
          ) : (
            <OptionList
              accessibilityLabel="Tema"
              options={(topics.data ?? []).map((topic) => ({
                value: topic.id,
                label: topic.nombre,
              }))}
              selected={topicId}
              onSelect={setTopicId}
            />
          )}
        </View>
      )}

      <Button title="Empezar simulacro" disabled={!ready} loading={starting} onPress={start} />
      {!ready && (
        <Text style={[styles.hint, { color: colors.muted }]}>
          {areaId === null
            ? 'Elige tu universidad y área.'
            : 'Elige el tema que quieres practicar.'}
        </Text>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  content: { gap: 14, padding: 20 },
  section: { gap: 14 },
  heading: { fontSize: 18, fontWeight: '700' },
  hint: { textAlign: 'center' },
})
