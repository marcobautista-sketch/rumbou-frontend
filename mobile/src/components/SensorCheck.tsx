import { useAudioPlayer } from 'expo-audio'
import { Directory, File, Paths } from 'expo-file-system'
import { useState } from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'
import { useVoiceRecorder } from '../hooks/useVoiceRecorder'
import { useColors } from '../theme/useColors'
import { pickSolutionPhoto } from '../utils/pickSolutionPhoto'
import { Button } from './Button'

const PHOTO_NAME = 'foto.jpg'
const AUDIO_NAME = 'audio.m4a'

function savedFile(name: string) {
  return new File(new Directory(Paths.document, 'prueba-sensores'), name)
}

function savedUri(name: string) {
  const file = savedFile(name)
  return file.exists ? file.uri : null
}

// La cámara y el grabador dejan sus archivos en una carpeta temporal: aquí pasan a una que el
// sistema no vacía, para comprobar que siguen ahí al reiniciar la app.
function keep(uri: string, name: string) {
  new Directory(Paths.document, 'prueba-sensores').create({ intermediates: true, idempotent: true })
  const target = savedFile(name)
  if (target.exists) target.delete()
  new File(uri).copy(target)
  return target.uri
}

// Prueba temporal: confirma en un celular real que la cámara, el micrófono y el guardado
// funcionan antes de construir el cuaderno de errores. Se retira cuando este exista.
export function SensorCheck() {
  const colors = useColors()
  const recorder = useVoiceRecorder()
  const player = useAudioPlayer(null)
  const [photoUri, setPhotoUri] = useState(() => savedUri(PHOTO_NAME))
  const [audioUri, setAudioUri] = useState(() => savedUri(AUDIO_NAME))
  const [problem, setProblem] = useState<string | null>(null)

  const attempt = async (action: () => Promise<void>) => {
    setProblem(null)
    try {
      await action()
    } catch (error) {
      setProblem(String(error))
    }
  }

  const takePhoto = () =>
    attempt(async () => {
      const photo = await pickSolutionPhoto('camera')
      if (photo) setPhotoUri(`${keep(photo.uri, PHOTO_NAME)}?v=${Date.now()}`)
    })

  const toggleRecording = () =>
    attempt(async () => {
      if (!recorder.recording) {
        await recorder.start()
        return
      }
      const uri = await recorder.stop()
      if (uri) setAudioUri(keep(uri, AUDIO_NAME))
    })

  const listen = () =>
    attempt(async () => {
      if (!audioUri) return
      player.replace({ uri: audioUri })
      player.play()
    })

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <Text style={[styles.title, { color: colors.text }]}>Prueba de sensores</Text>
      <Text style={{ color: colors.muted }}>
        Temporal. Toma una foto, graba unos segundos y escúchalo. Luego cierra la app por completo y
        vuelve aquí: ambos deben seguir guardados.
      </Text>
      {photoUri && (
        <Image
          source={{ uri: photoUri }}
          style={styles.photo}
          accessibilityLabel="Foto de prueba"
        />
      )}
      <Text style={{ color: colors.text }}>Foto: {photoUri ? 'guardada' : 'sin guardar'}</Text>
      <Text style={{ color: colors.text }}>Audio: {audioUri ? 'guardado' : 'sin guardar'}</Text>
      {problem && <Text style={{ color: colors.danger }}>{problem}</Text>}
      <Button title="Tomar foto" variant="secondary" onPress={takePhoto} />
      <Button
        title={recorder.recording ? `Detener (${recorder.seconds} s)` : 'Grabar'}
        variant="secondary"
        onPress={toggleRecording}
      />
      <Button title="Escuchar" variant="secondary" disabled={!audioUri} onPress={listen} />
    </View>
  )
}

const styles = StyleSheet.create({
  card: { gap: 10, borderRadius: 16, padding: 16 },
  title: { fontSize: 16, fontWeight: '700' },
  photo: { height: 160, borderRadius: 12 },
})
