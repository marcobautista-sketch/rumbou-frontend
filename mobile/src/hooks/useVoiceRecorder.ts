import {
  getRecordingPermissionsAsync,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  type RecordingOptions,
} from 'expo-audio'
import { useEffect, useState } from 'react'
import { Linking } from 'react-native'
import { askChoice } from '../utils/askChoice'

export const MAX_RECORDING_SECONDS = 30

// La voz no necesita estéreo ni 128 kbps: en mono y a 64 kbps el audio pesa cuatro veces menos.
const voiceOptions: RecordingOptions = {
  ...RecordingPresets.HIGH_QUALITY,
  numberOfChannels: 1,
  bitRate: 64000,
}

// Antes del aviso del sistema explicamos para qué es el micrófono; si lo niegan, queda escribir.
async function microphoneAllowed() {
  const current = await getRecordingPermissionsAsync()
  if (current.granted) return true
  if (current.canAskAgain) {
    const accepted =
      current.status !== 'undetermined' ||
      (await askChoice(
        'Usar el micrófono',
        'RumboU usa el micrófono solo mientras grabas tu pregunta para el asistente.',
        [{ text: 'Continuar', value: 'ok' }],
      ))
    if (!accepted) return false
    if ((await requestRecordingPermissionsAsync()).granted) return true
  }
  const choice = await askChoice(
    'Sin acceso al micrófono',
    'Puedes escribir tu pregunta o dar el permiso del micrófono en Ajustes.',
    [
      { text: 'Abrir Ajustes', value: 'settings' },
      { text: 'Escribir', value: 'write' },
    ],
  )
  if (choice === 'settings') await Linking.openSettings()
  return false
}

export function useVoiceRecorder() {
  const recorder = useAudioRecorder(voiceOptions)
  const [recording, setRecording] = useState(false)
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    if (!recording) return
    const timer = setInterval(
      () => setSeconds((value) => Math.min(value + 1, MAX_RECORDING_SECONDS)),
      1000,
    )
    return () => clearInterval(timer)
  }, [recording])

  const start = async () => {
    if (!(await microphoneAllowed())) return false
    await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true })
    await recorder.prepareToRecordAsync()
    // El tope lo pone el propio grabador: a los 30 s deja de grabar aunque no se toque nada.
    recorder.record({ forDuration: MAX_RECORDING_SECONDS })
    setSeconds(0)
    setRecording(true)
    return true
  }

  // Devuelve la uri del archivo grabado.
  const stop = async () => {
    setRecording(false)
    await recorder.stop()
    // Sin esto, en iPhone la respuesta hablada saldría por el auricular y casi no se oiría.
    await setAudioModeAsync({ allowsRecording: false })
    return recorder.uri
  }

  return { recording, seconds, start, stop }
}
