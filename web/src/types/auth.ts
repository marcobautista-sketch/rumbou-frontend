export type Role = 'USER' | 'REVIEWER' | 'ADMIN'

export interface User {
  id: number
  email: string
  nombre: string
  apellidos: string | null
  telefono: string | null
  role: Role
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  tokenType: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest extends LoginRequest {
  nombre: string
  apellidos?: string
  telefono?: string
}

export interface ResetPasswordRequest {
  token: string
  newPassword: string
}
