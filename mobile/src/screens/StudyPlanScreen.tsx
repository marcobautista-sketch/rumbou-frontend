import { Ionicons } from '@expo/vector-icons'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useCallback } from 'react'
import {
  ActivityIndicator,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { ErrorRetry } from '../components/ErrorRetry'
import { useFetch } from '../hooks/useFetch'
import type { RootStackParamList } from '../navigation/types'
import { examService } from '../services/examService'
import { studyPlanService } from '../services/studyPlanService'
import { useColors } from '../theme/useColors'
import { weakTopics, type TopicMistakes } from '../utils/weakTopics'

type StudyPlanScreenProps = NativeStackScreenProps<RootStackParamList, 'StudyPlan'>

const MAX_TOPICS = 3

function open(url: string) {
  void Linking.openURL(url)
}

function TopicVideos({ topicId }: { topicId: number }) {
  const colors = useColors()
  const fetchVideos = useCallback(
    (signal: AbortSignal) => studyPlanService.videos(topicId, signal),
    [topicId],
  )
  const { data, error, loading, retry } = useFetch(fetchVideos)

  if (loading)
    return <ActivityIndicator color={colors.primary} accessibilityLabel="Buscando videos" />
  if (error || !data) return <ErrorRetry message="No pudimos traer los videos." onRetry={retry} />

  return (
    <View style={styles.section}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {data.videos.map((video) => (
          <Pressable
            key={video.videoId}
            accessibilityRole="link"
            accessibilityLabel={`${video.titulo}, de ${video.canal}`}
            onPress={() => open(video.url)}
            style={styles.video}
          >
            {video.miniaturaUrl && (
              <Image source={{ uri: video.miniaturaUrl }} style={styles.thumbnail} />
            )}
            <Text numberOfLines={2} style={[styles.itemTitle, { color: colors.text }]}>
              {video.titulo}
            </Text>
            <Text style={{ color: colors.muted }}>{video.canal}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <Pressable
        accessibilityRole="link"
        onPress={() => open(data.busquedaUrl)}
        style={styles.link}
      >
        <Text style={[styles.linkText, { color: colors.accentText }]}>
          {data.videos.length > 0 ? 'Ver más videos en YouTube' : `Buscar clases de ${data.tema}`}
        </Text>
        <Ionicons name="open-outline" size={16} color={colors.accentText} />
      </Pressable>
    </View>
  )
}

function TopicBooks({ topicId, topic }: { topicId: number; topic: string }) {
  const colors = useColors()
  const fetchBooks = useCallback(
    (signal: AbortSignal) => studyPlanService.books(topicId, topic, signal),
    [topicId, topic],
  )
  const { data, error, loading, retry } = useFetch(fetchBooks)

  if (loading)
    return <ActivityIndicator color={colors.primary} accessibilityLabel="Buscando libros" />
  if (error || !data) return <ErrorRetry message="No pudimos traer los libros." onRetry={retry} />
  if (data.length === 0) {
    return <Text style={{ color: colors.muted }}>No encontramos libros para este tema.</Text>
  }

  return (
    <View style={styles.section}>
      {data.map((book) => (
        <Pressable
          key={book.url}
          accessibilityRole="link"
          onPress={() => open(book.url)}
          style={styles.book}
        >
          {book.coverUrl ? (
            <Image source={{ uri: book.coverUrl }} style={styles.cover} />
          ) : (
            <View style={[styles.cover, styles.noCover, { backgroundColor: colors.surfaceMuted }]}>
              <Ionicons name="book-outline" size={22} color={colors.muted} />
            </View>
          )}
          <View style={styles.flex}>
            <Text numberOfLines={2} style={[styles.itemTitle, { color: colors.text }]}>
              {book.title}
            </Text>
            <Text style={{ color: colors.muted }}>
              {[book.authors.slice(0, 2).join(', '), book.year].filter(Boolean).join(' · ')}
            </Text>
          </View>
        </Pressable>
      ))}
      <Text style={[styles.source, { color: colors.muted }]}>Fuente: {data[0].source}</Text>
    </View>
  )
}

function TopicPlan({ topic }: { topic: TopicMistakes }) {
  const colors = useColors()

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <Text accessibilityRole="header" style={[styles.topic, { color: colors.text }]}>
        {topic.tema}
      </Text>
      <Text style={{ color: colors.muted }}>
        {topic.incorrect} incorrectas · {topic.blank} en blanco
      </Text>
      <Text style={[styles.heading, { color: colors.text }]}>Videos para repasar</Text>
      <TopicVideos topicId={topic.temaId} />
      <Text style={[styles.heading, { color: colors.text }]}>Libros recomendados</Text>
      <TopicBooks topicId={topic.temaId} topic={topic.tema} />
    </View>
  )
}

// Sin examId (por ejemplo, desde el inicio) toma el último simulacro terminado.
export default function StudyPlanScreen({ route }: StudyPlanScreenProps) {
  const colors = useColors()
  const examId = route.params?.examId
  const fetchTopics = useCallback(
    async (signal: AbortSignal) => {
      const id = examId ?? (await examService.latestFinished(signal))?.id
      if (id === undefined) return null
      const exam = await examService.getDetail(id, signal)
      return weakTopics(exam.preguntas).slice(0, MAX_TOPICS)
    },
    [examId],
  )
  const { data: topics, error, loading, retry } = useFetch(fetchTopics)

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
    >
      <Text style={{ color: colors.muted }}>
        Los temas donde más fallaste en tu último simulacro, con clases en video y libros.
      </Text>
      {loading ? (
        <ActivityIndicator
          size="large"
          color={colors.primary}
          accessibilityLabel="Cargando tu plan de estudio"
        />
      ) : error ? (
        <ErrorRetry message={error.message} onRetry={retry} />
      ) : topics === null ? (
        <Text style={[styles.empty, { color: colors.text }]}>
          Aún no terminas ningún simulacro. Rinde uno y aquí verás qué repasar.
        </Text>
      ) : topics.length === 0 ? (
        <Text style={[styles.empty, { color: colors.text }]}>
          ¡Respondiste todo bien! Prueba ahora un simulacro completo.
        </Text>
      ) : (
        topics.map((topic) => <TopicPlan key={topic.temaId} topic={topic} />)
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  content: { gap: 16, padding: 20 },
  card: { gap: 8, borderRadius: 16, padding: 16 },
  topic: { fontSize: 20, fontWeight: '700' },
  heading: { marginTop: 8, fontSize: 16, fontWeight: '600' },
  section: { gap: 10 },
  row: { gap: 12 },
  video: { width: 220, gap: 4 },
  thumbnail: { width: 220, height: 124, borderRadius: 12 },
  itemTitle: { fontWeight: '600' },
  link: { flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 44 },
  linkText: { fontWeight: '600' },
  book: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  cover: { width: 48, height: 72, borderRadius: 6 },
  noCover: { alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1 },
  source: { fontSize: 12 },
  empty: { fontSize: 16, textAlign: 'center' },
})
