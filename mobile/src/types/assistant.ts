export type MessageRole = 'POSTULANTE' | 'ASISTENTE'

export interface AssistantMessage {
  rol: MessageRole
  texto: string
}

export interface AssistantReply {
  transcripcion: string
  respuesta: string
}
