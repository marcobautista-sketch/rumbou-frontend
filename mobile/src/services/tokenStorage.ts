import * as SecureStore from 'expo-secure-store'
import type { AuthTokens } from '../types/auth'

const ACCESS_TOKEN_KEY = 'rumbou.accessToken'
const REFRESH_TOKEN_KEY = 'rumbou.refreshToken'

let accessToken: string | null = null

export const tokenStorage = {
  getAccessToken: () => accessToken,

  getRefreshToken: () => SecureStore.getItemAsync(REFRESH_TOKEN_KEY),

  async save(tokens: AuthTokens) {
    accessToken = tokens.accessToken
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, tokens.accessToken)
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokens.refreshToken)
  },

  async clear() {
    accessToken = null
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY)
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY)
  },
}
