import type { Subscription } from '../types/subscription'
import { ApiError } from './apiError'
import { apiClient } from './client'

export const subscriptionService = {
  async getCurrent(signal?: AbortSignal) {
    try {
      const { data } = await apiClient.get<Subscription>('/suscripciones/me', { signal })
      return data
    } catch (error) {
      if (error instanceof ApiError && error.kind === 'notFound') return null
      throw error
    }
  },

  async subscribeToPro() {
    const { data } = await apiClient.post<Subscription>('/suscripciones')
    return data
  },
}
