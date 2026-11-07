import {
  getRecordingPermissionsAsync,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  type AudioRecorder,
  type RecordingOptions,
} from 'expo-audio'
import { useCallback, useEffect, useRef, useState } from 'react'
import { AppState, Linking } from 'react-native'
import { askChoice } from '../utils/askChoice'

export const MAX_RECORDING_SECONDS = 30

// En iPhone, lo que no se pasa aquí vuelve a su valor por defecto: sin playsInSilentMode lo
// grabado no se oiría con el interruptor en silencio, y con la grabación activa saldría por el
// auricular.
export const PLAYBACK_AUDIO_MODE = { allowsRecording: false, playsInSilentMode: true }

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
        'RumboU usa el micrófono solo mientras grabas tu explicación de una pregunta.',
        [{ text: 'Continuar', value: 'ok' }],
      ))
    if (!accepted) return false
    if ((await requestRecordingPermissionsAsync()).granted) return true
  }
  const choice = await askChoice(
    'Sin acceso al micrófono',
    'Puedes escribir una nota o dar el permiso del micrófono en Ajustes.',
    [
      { text: 'Abrir Ajustes', value: 'settings' },
      { text: 'Escribir', value: 'write' },
    ],
  )
  if (choice === 'settings') await Linking.openSettings()
  return false
}

// El grabador pudo detenerse solo al llegar al tope, o ya estar liberado al salir de la pantalla:
// en ambos casos stop() falla y no es un error. Lo importante es soltar el micrófono.
async function releaseMicrophone(recorder: AudioRecorder) {
  try {
    await recorder.stop()
  } catch {
    // Ya estaba detenido.
  }
  await setAudioModeAsync(PLAYBACK_AUDIO_MODE)
}

interface VoiceRecorderOptions {
  // Se llama cuando la grabación termina sola: al llegar al tope o si la app pasa a segundo plano.
  onAutoStop?: (uri: string) => void
}

export function useVoiceRecorder({ onAutoStop }: VoiceRecorderOptions = {}) {
  const recorder = useAudioRecorder(voiceOptions)
  const [recording, setRecording] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const active = useRef(false)
  const autoStopHandler = useRef(onAutoStop)

  useEffect(() => {
    autoStopHandler.current = onAutoStop
  }, [onAutoStop])

  const finish = useCallback(async () => {
    if (!active.current) return null
    active.current = false
    setRecording(false)
    await releaseMicrophone(recorder)
    return recorder.uri
  }, [recorder])

  const stopAutomatically = useCallback(() => {
    void finish().then((uri) => {
      if (uri) autoStopHandler.current?.(uri)
    })
  }, [finish])

  useEffect(() => {
    if (!recording) return
    const startedAt = Date.now()
    const timer = setInterval(() => {
      const elapsed = Math.round((Date.now() - startedAt) / 1000)
      setSeconds(Math.min(elapsed, MAX_RECORDING_SECONDS))
      if (elapsed >= MAX_RECORDING_SECONDS) stopAutomatically()
    }, 1000)
    return () => clearInterval(timer)
  }, [recording, stopAutomatically])

  // Una llamada o salir de la app corta la grabación: se conserva lo grabado hasta ese momento.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') stopAutomatically()
    })
    return () => subscription.remove()
  }, [stopAutomatically])

  // Al cerrar la pantalla se suelta el micrófono y se descarta lo que estaba grabando.
  useEffect(
    () => () => {
      if (!active.current) return
      active.current = false
      void releaseMicrophone(recorder)
    },
    [recorder],
  )

  const start = async () => {
    if (!(await microphoneAllowed())) return false
    await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true })
    await recorder.prepareToRecordAsync()
    // El tope también lo pone el propio grabador, por si el temporizador de arriba se atrasa.
    recorder.record({ forDuration: MAX_RECORDING_SECONDS })
    active.current = true
    setSeconds(0)
    setRecording(true)
    return true
  }

  return { recording, seconds, start, stop: finish }
}
