import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import type { AuthTokens } from '../types/auth'
import { toApiError } from './apiError'
import { tokenStore } from './tokenStore'

interface RetriableRequest extends InternalAxiosRequestConfig {
  retriedWithNewToken?: boolean
  retriedAfterFailure?: boolean
}

const RETRY_DELAY_MS = 1000

// Solo se repiten las lecturas (GET) que fallaron por la red o porque el servidor estaba
// caído un momento (502, 503, 504): repetirlas no cambia nada en el backend.
function canRetry(error: AxiosError, request: RetriableRequest) {
  if (request.method !== 'get' || request.retriedAfterFailure || axios.isCancel(error)) return false
  const status = error.response?.status
  return status === undefined || status === 502 || status === 503 || status === 504
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const baseURL = import.meta.env.VITE_API_URL ?? '/api/v1'
const clientConfig = { baseURL, timeout: 15000, withCredentials: true }

export const apiClient = axios.create(clientConfig)
const refreshClient = axios.create(clientConfig)

let pendingRefresh: Promise<string> | null = null
let sessionExpiredListener: (() => void) | null = null

export function onSessionExpired(listener: () => void) {
  sessionExpiredListener = listener
  return () => {
    sessionExpiredListener = null
  }
}

// Si varias peticiones reciben 401 a la vez, todas esperan la misma renovación en vez de pedir
// un token nuevo cada una. El refresh token viaja solo en la cookie HttpOnly.
export function refreshAccessToken(): Promise<string> {
  pendingRefresh ??= refreshClient
    .post<AuthTokens>('/auth/refresh')
    .then(({ data }) => {
      tokenStore.set(data.accessToken)
      return data.accessToken
    })
    .finally(() => {
      pendingRefresh = null
    })
  return pendingRefresh
}

apiClient.interceptors.request.use((config) => {
  const token = tokenStore.get()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    const request = axios.isAxiosError(error) ? (error.config as RetriableRequest) : undefined

    if (axios.isAxiosError(error) && request && canRetry(error, request)) {
      request.retriedAfterFailure = true
      await wait(RETRY_DELAY_MS)
      return apiClient(request)
    }

    // 401 = el access token venció: se renueva y se repite la petición una sola vez.
    const sessionCanBeRenewed =
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      request !== undefined &&
      !request.retriedWithNewToken &&
      tokenStore.get() !== null

    if (!sessionCanBeRenewed) throw toApiError(error)

    request.retriedWithNewToken = true
    try {
      await refreshAccessToken()
    } catch {
      tokenStore.set(null)
      sessionExpiredListener?.()
      throw toApiError(error)
    }
    return apiClient(request)
  },
)
