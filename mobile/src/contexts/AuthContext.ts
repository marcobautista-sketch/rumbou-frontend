import { createContext } from 'react'
import type { LoginRequest, RegisterRequest, User } from '../types/auth'

export type AuthStatus = 'loading' | 'locked' | 'authenticated' | 'anonymous'

export interface AuthContextValue {
  user: User | null
  status: AuthStatus
  login: (credentials: LoginRequest) => Promise<void>
  register: (account: RegisterRequest) => Promise<void>
  logout: () => Promise<void>
  updateUser: (user: User) => void
  unlockWithBiometrics: () => Promise<boolean>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
