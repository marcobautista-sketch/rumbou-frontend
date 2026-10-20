import { isAxiosError, isCancel } from 'axios'

export type ApiErrorKind =
  | 'network'
  | 'timeout'
  | 'canceled'
  | 'validation'
  | 'unauthorized'
  | 'forbidden'
  | 'notFound'
  | 'conflict'
  | 'unavailable'
  | 'server'
  | 'unknown'

const defaultMessages: Record<ApiErrorKind, string> = {
  network: 'No hay conexión con el servidor. Revisa tu internet e intenta de nuevo.',
  timeout: 'El servidor tardó demasiado en responder. Intenta de nuevo.',
  canceled: 'La solicitud se canceló.',
  validation: 'Revisa los datos ingresados.',
  unauthorized: 'Tu sesión expiró. Vuelve a iniciar sesión.',
  forbidden: 'No tienes permiso para realizar esta acción.',
  notFound: 'No encontramos lo que buscas.',
  conflict: 'Esta acción entra en conflicto con datos que ya existen.',
  unavailable: 'El servidor está en pausa en este momento. Intenta más tarde.',
  server: 'Tuvimos un problema en el servidor. Intenta de nuevo en unos minutos.',
  unknown: 'Ocurrió un error inesperado.',
}

export class ApiError extends Error {
  readonly kind: ApiErrorKind
  readonly status?: number

  constructor(kind: ApiErrorKind, message?: string, status?: number) {
    super(message || defaultMessages[kind])
    this.name = 'ApiError'
    this.kind = kind
    this.status = status
  }
}

function kindFromStatus(status: number): ApiErrorKind {
  if (status === 400 || status === 422) return 'validation'
  if (status === 401) return 'unauthorized'
  if (status === 403) return 'forbidden'
  if (status === 404) return 'notFound'
  if (status === 409) return 'conflict'
  if (status === 502 || status === 503 || status === 504) return 'unavailable'
  if (status >= 500) return 'server'
  return 'unknown'
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error
  if (isCancel(error)) return new ApiError('canceled')
  if (!isAxiosError<{ message?: string }>(error)) return new ApiError('unknown')
  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') return new ApiError('timeout')
  if (!error.response) return new ApiError('network')

  const { status, data } = error.response
  const serverMessage = status < 500 ? data?.message : undefined
  return new ApiError(kindFromStatus(status), serverMessage, status)
}
