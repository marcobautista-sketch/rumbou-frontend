import type { AssistantMessage, AssistantReply } from '../types/assistant'
import { apiClient } from './client'

// Gemini tarda unos segundos más cuando además tiene que escuchar el audio.
const ASSISTANT_TIMEOUT_MS = 60000

export const assistantService = {
  async ask(message: string, history: AssistantMessage[]) {
    const { data } = await apiClient.post<AssistantReply>(
      '/asistente/mensajes',
      { mensaje: message, historial: history },
      { timeout: ASSISTANT_TIMEOUT_MS },
    )
    return data
  },

  // El audio viaja como archivo desde su uri; el historial, como texto JSON en el mismo formulario.
  async askByVoice(audioUri: string, history: AssistantMessage[]) {
    const form = new FormData()
    form.append('audio', {
      uri: audioUri,
      name: 'pregunta.m4a',
      type: 'audio/mp4',
    } as unknown as Blob)
    form.append('historial', JSON.stringify(history))
    const { data } = await apiClient.post<AssistantReply>('/asistente/voz', form, {
      timeout: ASSISTANT_TIMEOUT_MS,
    })
    return data
  },
}
