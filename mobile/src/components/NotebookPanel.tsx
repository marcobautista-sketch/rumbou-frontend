import { Ionicons } from '@expo/vector-icons'
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio'
import { useRef, useState } from 'react'
import { Alert, Image, StyleSheet, Text, View } from 'react-native'
import { SegmentedButtons, TextInput } from 'react-native-paper'
import { useAuth } from '../hooks/useAuth'
import {
  MAX_RECORDING_SECONDS,
  PLAYBACK_AUDIO_MODE,
  useVoiceRecorder,
} from '../hooks/useVoiceRecorder'
import { ApiError } from '../services/apiError'
import {
  MAX_NOTEBOOK_PHOTOS,
  notebookStore,
  type NotebookEntry,
  type NotebookStatus,
} from '../services/notebookStore'
import { useColors } from '../theme/useColors'
import type { ExamQuestion } from '../types/exam'
import { formatMath } from '../utils/formatMath'
import { notify } from '../utils/notify'
import { pickSolutionPhoto, type PhotoSource } from '../utils/pickSolutionPhoto'
import { Button } from './Button'

const MAX_NOTE_LENGTH = 500
const STATEMENT_PREVIEW_LENGTH = 140

const statusOptions = [
  { value: 'REVIEW', label: 'Repasar' },
  { value: 'UNDERSTOOD', label: 'Ya la entendí' },
]

interface NotebookPanelProps {
  question: ExamQuestion
  examId: number
}

function blankEntry(question: ExamQuestion, examId: number): NotebookEntry {
  return {
    questionId: question.preguntaId,
    examId,
    topic: question.tema,
    statement: formatMath(question.enunciado).slice(0, STATEMENT_PREVIEW_LENGTH),
    photo: null,
    audio: null,
    note: '',
    status: null,
    updatedAt: '',
  }
}

function failure(message: string) {
  notify.error(new ApiError('unknown', message))
}

function NotebookEditor({ question, examId, userId }: NotebookPanelProps & { userId: number }) {
  const colors = useColors()
  const [entry, setEntry] = useState(
    () => notebookStore.get(userId, question.preguntaId) ?? blankEntry(question, examId),
  )
  // Guardar una foto o un audio toma un momento: cada cambio se suma a la última versión, no a
  // la que se veía cuando empezó.
  const latestEntry = useRef(entry)
  const hasNotes = Boolean(entry.photo || entry.audio || entry.note.trim() || entry.status)
  const player = useAudioPlayer(null)
  const { playing } = useAudioPlayerStatus(player)

  // Cualquier apunte nuevo queda por repasar hasta que se marque como entendido.
  const update = (changes: Partial<NotebookEntry>) => {
    const current = latestEntry.current
    const next = { ...current, status: current.status ?? 'REVIEW', ...changes }
    latestEntry.current = next
    setEntry(next)
    notebookStore.save(userId, next)
  }

  const saveAudio = async (uri: string) => {
    try {
      const name = `audio-${question.preguntaId}-${Date.now()}.m4a`
      await notebookStore.keepFile(userId, uri, name)
      notebookStore.deleteFile(userId, latestEntry.current.audio)
      update({ audio: name })
    } catch {
      failure('No pudimos guardar tu audio. Intenta de nuevo.')
    }
  }

  const recorder = useVoiceRecorder({ onAutoStop: (uri) => void saveAudio(uri) })

  const addPhoto = async (source: PhotoSource) => {
    if (!entry.photo && notebookStore.photoCount(userId) >= MAX_NOTEBOOK_PHOTOS) {
      Alert.alert(
        'Cuaderno lleno',
        `Puedes guardar hasta ${MAX_NOTEBOOK_PHOTOS} fotos. Quita alguna para agregar otra.`,
      )
      return
    }
    try {
      const photo = await pickSolutionPhoto(source)
      if (!photo) return
      const name = `foto-${question.preguntaId}-${Date.now()}.jpg`
      await notebookStore.keepFile(userId, photo.uri, name)
      notebookStore.deleteFile(userId, latestEntry.current.photo)
      update({ photo: name })
    } catch {
      failure('No pudimos guardar tu foto. Intenta de nuevo.')
    }
  }

  const removePhoto = () => {
    notebookStore.deleteFile(userId, entry.photo)
    update({ photo: null })
  }

  const toggleRecording = async () => {
    try {
      if (!recorder.recording) {
        player.pause()
        await recorder.start()
        return
      }
      const uri = await recorder.stop()
      if (uri) await saveAudio(uri)
    } catch {
      failure('No pudimos usar el micrófono. Puedes escribir una nota.')
    }
  }

  const toggleAudio = async () => {
    if (playing) {
      player.pause()
      return
    }
    if (!entry.audio) return
    try {
      await setAudioModeAsync(PLAYBACK_AUDIO_MODE)
      player.replace({ uri: notebookStore.fileUri(userId, entry.audio) })
      player.play()
    } catch {
      failure('No pudimos reproducir tu audio.')
    }
  }

  const removeAudio = () => {
    player.pause()
    notebookStore.deleteFile(userId, entry.audio)
    update({ audio: null })
  }

  const confirmRemove = () =>
    Alert.alert(
      '¿Quitar del cuaderno?',
      'Se borrarán la foto, el audio y la nota de esta pregunta.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Quitar',
          style: 'destructive',
          onPress: () => {
            player.pause()
            notebookStore.remove(userId, question.preguntaId)
            latestEntry.current = blankEntry(question, examId)
            setEntry(latestEntry.current)
          },
        },
      ],
    )

  return (
    <View style={[styles.panel, { backgroundColor: colors.surfaceMuted }]}>
      <View style={styles.heading}>
        <Ionicons name="book-outline" size={20} color={colors.primary} accessible={false} />
        <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>
          Mi cuaderno
        </Text>
      </View>
      <Text style={[styles.hint, { color: colors.muted }]}>
        Fotografía tu procedimiento, compáralo con la resolución y explícalo con tus palabras.
      </Text>

      {entry.photo && (
        <Image
          source={{ uri: notebookStore.fileUri(userId, entry.photo) }}
          resizeMode="contain"
          style={[styles.photo, { backgroundColor: colors.surface }]}
          accessibilityLabel="Foto de tu procedimiento"
        />
      )}
      <View style={styles.row}>
        <View style={styles.flex}>
          <Button
            title={entry.photo ? 'Cambiar foto' : 'Tomar foto'}
            variant="secondary"
            disabled={recorder.recording}
            onPress={() => void addPhoto('camera')}
          />
        </View>
        <View style={styles.flex}>
          {entry.photo ? (
            <Button
              title="Quitar foto"
              variant="ghost"
              disabled={recorder.recording}
              onPress={removePhoto}
            />
          ) : (
            <Button
              title="Galería"
              variant="ghost"
              disabled={recorder.recording}
              onPress={() => void addPhoto('library')}
            />
          )}
        </View>
      </View>

      {recorder.recording && (
        <View accessibilityLiveRegion="polite" style={styles.heading}>
          <Ionicons name="radio-button-on" size={18} color={colors.danger} accessible={false} />
          <Text style={{ color: colors.text }}>
            Grabando: {recorder.seconds} de {MAX_RECORDING_SECONDS} s
          </Text>
        </View>
      )}
      <Button
        title={
          recorder.recording ? 'Detener' : entry.audio ? 'Grabar de nuevo' : 'Grabar mi explicación'
        }
        variant="secondary"
        onPress={() => void toggleRecording()}
      />
      {entry.audio && !recorder.recording && (
        <View style={styles.row}>
          <View style={styles.flex}>
            <Button
              title={playing ? 'Pausar' : 'Escuchar'}
              variant="secondary"
              onPress={() => void toggleAudio()}
            />
          </View>
          <View style={styles.flex}>
            <Button title="Borrar audio" variant="ghost" onPress={removeAudio} />
          </View>
        </View>
      )}

      <TextInput
        mode="outlined"
        label="Nota"
        accessibilityLabel="Nota"
        placeholder="¿En qué te equivocaste?"
        value={entry.note}
        onChangeText={(note) => update({ note })}
        multiline
        maxLength={MAX_NOTE_LENGTH}
        style={{ backgroundColor: colors.surface }}
      />

      <SegmentedButtons
        value={entry.status ?? ''}
        onValueChange={(status) => update({ status: status as NotebookStatus })}
        buttons={statusOptions}
      />

      <Text style={[styles.hint, { color: colors.muted }]}>
        Se guarda solo en este celular. Si desinstalas la app, se borra.
      </Text>
      {hasNotes && !recorder.recording && (
        <Button title="Quitar del cuaderno" variant="ghost" onPress={confirmRemove} />
      )}
    </View>
  )
}

// Fotos, audio y nota propios de una pregunta. Es una autoevaluación: nada se sube ni se califica.
export function NotebookPanel(props: NotebookPanelProps) {
  const { user } = useAuth()
  if (!user) return null
  return <NotebookEditor {...props} userId={user.id} />
}

const styles = StyleSheet.create({
  panel: { gap: 12, borderRadius: 12, padding: 14 },
  heading: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 16, fontWeight: '700' },
  hint: { fontSize: 13, lineHeight: 18 },
  photo: { width: '100%', height: 240, borderRadius: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  flex: { flex: 1 },
})
