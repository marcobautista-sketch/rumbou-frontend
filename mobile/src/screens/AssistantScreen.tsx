import { Ionicons } from '@expo/vector-icons'
import * as Speech from 'expo-speech'
import { useEffect, useRef, useState, type ComponentProps, type ComponentRef } from 'react'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { MAX_RECORDING_SECONDS, useVoiceRecorder } from '../hooks/useVoiceRecorder'
import { assistantService } from '../services/assistantService'
import { useColors } from '../theme/useColors'
import type { AssistantMessage, AssistantReply } from '../types/assistant'
import { formatMath } from '../utils/formatMath'
import { notify } from '../utils/notify'

interface ChatMessage extends AssistantMessage {
  id: number
}

const HISTORY_SIZE = 6

const suggestions = [
  '¿Cuándo es mi próximo examen?',
  '¿Qué tema debería repasar hoy?',
  '¿Cómo voy para ingresar a mi carrera?',
]

function Bubble({ message }: { message: AssistantMessage }) {
  const colors = useColors()
  const mine = message.rol === 'POSTULANTE'

  if (mine) {
    return (
      <View style={[styles.bubble, styles.mine, { backgroundColor: colors.primary }]}>
        <Text style={[styles.bubbleText, { color: colors.onPrimary }]}>{message.texto}</Text>
      </View>
    )
  }
  return (
    <View style={styles.assistantRow}>
      <View style={[styles.avatar, { backgroundColor: colors.accent }]}>
        <Ionicons name="sparkles" size={16} color={colors.onAccent} />
      </View>
      <View
        style={[
          styles.bubble,
          styles.theirs,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.bubbleText, { color: colors.text }]}>{formatMath(message.texto)}</Text>
      </View>
    </View>
  )
}

function RoundButton({
  icon,
  label,
  onPress,
  disabled,
  accent = false,
}: {
  icon: ComponentProps<typeof Ionicons>['name']
  label: string
  onPress: () => void
  disabled?: boolean
  accent?: boolean
}) {
  const colors = useColors()
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.round,
        { backgroundColor: accent ? colors.accent : colors.primary },
        (pressed || disabled) && styles.dimmed,
      ]}
    >
      <Ionicons name={icon} size={22} color={accent ? colors.onAccent : colors.onPrimary} />
    </Pressable>
  )
}

// Sensor de micrófono: preguntas por voz al asistente, que responde con el progreso del postulante.
export default function AssistantScreen() {
  const colors = useColors()
  const { top, bottom } = useSafeAreaInsets()
  const voice = useVoiceRecorder()
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null)
  const nextId = useRef(0)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState('')
  const [thinking, setThinking] = useState(false)
  const [readAloud, setReadAloud] = useState(true)

  // Al salir de la pantalla deja de hablar.
  useEffect(
    () => () => {
      void Speech.stop()
    },
    [],
  )

  const append = (...items: AssistantMessage[]) =>
    setMessages((previous) => [
      ...previous,
      ...items.map((item) => ({ ...item, id: nextId.current++ })),
    ])

  const history = () => messages.slice(-HISTORY_SIZE).map(({ rol, texto }) => ({ rol, texto }))

  const speak = (text: string) => {
    if (readAloud) Speech.speak(text, { language: 'es-MX' })
  }

  const ask = async (
    request: () => Promise<AssistantReply>,
    onReply: (reply: AssistantReply) => void,
  ) => {
    setThinking(true)
    try {
      const reply = await request()
      onReply(reply)
      speak(reply.respuesta)
    } catch (error) {
      notify.error(error)
    } finally {
      setThinking(false)
    }
  }

  const sendText = (text: string) => {
    const question = text.trim()
    if (!question || thinking) return
    const previous = history()
    setDraft('')
    append({ rol: 'POSTULANTE', texto: question })
    void ask(
      () => assistantService.ask(question, previous),
      (reply) => append({ rol: 'ASISTENTE', texto: reply.respuesta }),
    )
  }

  const toggleRecording = async () => {
    if (!voice.recording) {
      await Speech.stop()
      try {
        await voice.start()
      } catch (error) {
        notify.error(error)
      }
      return
    }
    const uri = await voice.stop()
    if (!uri) return
    const previous = history()
    void ask(
      () => assistantService.askByVoice(uri, previous),
      (reply) =>
        append(
          { rol: 'POSTULANTE', texto: reply.transcripcion || 'Mensaje de voz' },
          { rol: 'ASISTENTE', texto: reply.respuesta },
        ),
    )
  }

  const toggleReadAloud = () => {
    if (readAloud) void Speech.stop()
    setReadAloud((value) => !value)
  }

  const typing = draft.trim().length > 0

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      // En iPhone el teclado se mide desde arriba: se descuenta la barra de estado y el encabezado.
      keyboardVerticalOffset={Platform.OS === 'ios' ? top + 44 : 0}
    >
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.content}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        <View style={[styles.intro, { backgroundColor: colors.surfaceMuted }]}>
          <Text style={[styles.introTitle, { color: colors.text }]}>Asistente RumboU</Text>
          <Text style={{ color: colors.muted }}>
            Pregúntame por tu próximo examen, tus temas débiles o un ejercicio. Toca el micrófono
            para hablar o escribe tu pregunta.
          </Text>
          <Pressable
            accessibilityRole="switch"
            accessibilityState={{ checked: readAloud }}
            onPress={toggleReadAloud}
            style={styles.toggle}
          >
            <Ionicons
              name={readAloud ? 'volume-high' : 'volume-mute'}
              size={18}
              color={colors.accentText}
            />
            <Text style={[styles.toggleText, { color: colors.accentText }]}>
              {readAloud ? 'Leo mis respuestas en voz alta' : 'Respuestas en silencio'}
            </Text>
          </Pressable>
        </View>

        {messages.length === 0 && (
          <View style={styles.suggestions}>
            {suggestions.map((suggestion) => (
              <Pressable
                key={suggestion}
                accessibilityRole="button"
                onPress={() => sendText(suggestion)}
                style={[styles.chip, { backgroundColor: colors.chip }]}
              >
                <Text style={{ color: colors.primary }}>{suggestion}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {messages.map((message) => (
          <Bubble key={message.id} message={message} />
        ))}
        {thinking && (
          <View style={styles.assistantRow} accessibilityLabel="El asistente está pensando">
            <ActivityIndicator color={colors.accentText} />
            <Text style={{ color: colors.muted }}>Pensando…</Text>
          </View>
        )}
      </ScrollView>

      {voice.recording && (
        <View
          accessibilityLiveRegion="polite"
          style={[styles.recording, { backgroundColor: colors.dangerSoft }]}
        >
          <View style={[styles.dot, { backgroundColor: colors.danger }]} />
          <Text style={{ color: colors.danger }}>
            {voice.seconds < MAX_RECORDING_SECONDS
              ? `Escuchando… 0:${String(voice.seconds).padStart(2, '0')}. Toca el botón para enviar.`
              : 'Llegaste a 30 segundos. Toca el botón para enviar.'}
          </Text>
        </View>
      )}

      <View
        style={[
          styles.inputRow,
          {
            borderColor: colors.border,
            backgroundColor: colors.surface,
            paddingBottom: bottom + 8,
          },
        ]}
      >
        <TextInput
          accessibilityLabel="Pregunta para el asistente"
          value={draft}
          onChangeText={setDraft}
          placeholder="Pregunta sobre el examen o un tema…"
          placeholderTextColor={colors.muted}
          editable={!voice.recording}
          maxLength={500}
          returnKeyType="send"
          onSubmitEditing={() => sendText(draft)}
          style={[styles.input, { color: colors.text, backgroundColor: colors.background }]}
        />
        {typing ? (
          <RoundButton
            icon="send"
            label="Enviar pregunta"
            disabled={thinking}
            onPress={() => sendText(draft)}
          />
        ) : (
          <RoundButton
            icon={voice.recording ? 'stop' : 'mic'}
            label={voice.recording ? 'Detener y enviar' : 'Hablar con el asistente'}
            accent
            disabled={thinking}
            onPress={toggleRecording}
          />
        )}
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { gap: 12, padding: 16 },
  intro: { gap: 6, borderRadius: 16, padding: 16 },
  introTitle: { fontSize: 20, fontWeight: '700' },
  toggle: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44 },
  toggleText: { fontWeight: '600' },
  suggestions: { gap: 8 },
  chip: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10 },
  bubble: { maxWidth: '85%', borderRadius: 16, padding: 12 },
  mine: { alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  theirs: { flexShrink: 1, borderWidth: 1, borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 16, lineHeight: 22 },
  assistantRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  avatar: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  recording: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderTopWidth: 1,
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  input: { flex: 1, minHeight: 48, borderRadius: 24, paddingHorizontal: 16, fontSize: 16 },
  round: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
  },
  dimmed: { opacity: 0.6 },
})
