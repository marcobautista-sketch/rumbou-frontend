// El access token vive solo en memoria (no en localStorage): un script inyectado no puede leerlo
// y se pierde al recargar. Al volver a abrir la web se pide otro con el refresh token de la cookie.
let accessToken: string | null = null

export const tokenStore = {
  get: () => accessToken,
  set: (token: string | null) => {
    accessToken = token
  },
}
