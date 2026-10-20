import { createContext } from 'react'
import type { LoginRequest, RegisterRequest, Role, User } from '../types/auth'

export type AuthStatus = 'loading' | 'authenticated' | 'anonymous'

export interface AuthContextValue {
  user: User | null
  status: AuthStatus
  login: (credentials: LoginRequest) => Promise<void>
  register: (account: RegisterRequest) => Promise<void>
  logout: () => Promise<void>
  hasRole: (...roles: Role[]) => boolean
}

export const AuthContext = createContext<AuthContextValue | null>(null)
