import {
  create,
  isAxiosError,
  isCancel,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios'
import type { AuthTokens } from '../types/auth'
import { toApiError } from './apiError'
import { tokenStorage } from './tokenStorage'

interface RetriableRequest extends InternalAxiosRequestConfig {
  retriedWithNewToken?: boolean
  retriedAfterFailure?: boolean
}

const RETRY_DELAY_MS = 1000

// Solo se repiten las lecturas (GET) que fallaron por la red o porque el servidor estaba
// caído un momento (502, 503, 504): repetirlas no cambia nada en el backend. Igual que en la web.
function canRetry(error: AxiosError, request: RetriableRequest) {
  if (request.method !== 'get' || request.retriedAfterFailure || isCancel(error)) return false
  const status = error.response?.status
  return status === undefined || status === 502 || status === 503 || status === 504
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const clientConfig = {
  baseURL: `${process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080'}/api/v1`,
  timeout: 15000,
}

export const apiClient = create(clientConfig)
const refreshClient = create(clientConfig)

let pendingRefresh: Promise<void> | null = null
let sessionExpiredListener: (() => void) | null = null

export function onSessionExpired(listener: () => void) {
  sessionExpiredListener = listener
  return () => {
    sessionExpiredListener = null
  }
}

async function requestNewTokens() {
  const refreshToken = await tokenStorage.getRefreshToken()
  if (!refreshToken) throw new Error('No hay sesión guardada')
  const { data } = await refreshClient.post<AuthTokens>('/auth/refresh', { refreshToken })
  await tokenStorage.save(data)
}

// Si varias peticiones reciben 401 a la vez, todas esperan la misma renovación en vez de pedir
// tokens nuevos cada una. A diferencia de la web, el refresh token viaja en el cuerpo.
export function refreshTokens(): Promise<void> {
  pendingRefresh ??= requestNewTokens().finally(() => {
    pendingRefresh = null
  })
  return pendingRefresh
}

apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    const request = isAxiosError(error) ? (error.config as RetriableRequest) : undefined

    if (isAxiosError(error) && request && canRetry(error, request)) {
      request.retriedAfterFailure = true
      await wait(RETRY_DELAY_MS)
      return apiClient(request)
    }

    // 401 = el access token venció: se renueva y se repite la petición una sola vez.
    const sessionCanBeRenewed =
      isAxiosError(error) &&
      error.response?.status === 401 &&
      request !== undefined &&
      !request.retriedWithNewToken &&
      tokenStorage.getAccessToken() !== null

    if (!sessionCanBeRenewed) throw toApiError(error)

    request.retriedWithNewToken = true
    try {
      await refreshTokens()
    } catch {
      await tokenStorage.clear()
      sessionExpiredListener?.()
      throw toApiError(error)
    }
    return apiClient(request)
  },
)
