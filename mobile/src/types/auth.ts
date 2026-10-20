export type Role = 'USER' | 'REVIEWER' | 'ADMIN'

export interface User {
  id: number
  email: string
  nombre: string
  role: Role
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest extends LoginRequest {
  nombre: string
}
