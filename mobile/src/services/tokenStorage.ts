import * as SecureStore from 'expo-secure-store'
import type { AuthTokens } from '../types/auth'

const REFRESH_TOKEN_KEY = 'rumbou.refreshToken'

// El access token dura poco y vive solo en memoria. El refresh token se guarda cifrado con
// SecureStore para que, al volver a abrir la app, se pida un access token nuevo sin la contraseña.
let accessToken: string | null = null

export const tokenStorage = {
  getAccessToken: () => accessToken,

  getRefreshToken: () => SecureStore.getItemAsync(REFRESH_TOKEN_KEY),

  async save(tokens: AuthTokens) {
    accessToken = tokens.accessToken
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokens.refreshToken)
  },

  async clear() {
    accessToken = null
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY)
  },
}
