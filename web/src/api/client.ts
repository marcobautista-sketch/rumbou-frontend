import axios, { type InternalAxiosRequestConfig } from 'axios'
import type { AuthTokens } from '../types/auth'
import { toApiError } from './apiError'
import { tokenStore } from './tokenStore'

interface RetriableRequest extends InternalAxiosRequestConfig {
  retried?: boolean
}

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
    const sessionCanBeRenewed =
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      request !== undefined &&
      !request.retried &&
      tokenStore.get() !== null

    if (!sessionCanBeRenewed) throw toApiError(error)

    request.retried = true
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
