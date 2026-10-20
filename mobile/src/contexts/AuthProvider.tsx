import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { authService } from '../services/authService'
import { onSessionExpired } from '../services/client'
import { userService } from '../services/userService'
import type { LoginRequest, RegisterRequest, User } from '../types/auth'
import { AuthContext, type AuthStatus } from './AuthContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<AuthStatus>('loading')

  const endSession = useCallback(() => {
    setUser(null)
    setStatus('anonymous')
  }, [])

  const loadUser = useCallback(async () => {
    setUser(await userService.getMe())
    setStatus('authenticated')
  }, [])

  useEffect(() => {
    authService.restoreSession().then(loadUser).catch(endSession)
    return onSessionExpired(endSession)
  }, [endSession, loadUser])

  const login = useCallback(
    async (credentials: LoginRequest) => {
      await authService.login(credentials)
      await loadUser()
    },
    [loadUser],
  )

  const register = useCallback(
    async (account: RegisterRequest) => {
      await authService.register(account)
      await loadUser()
    },
    [loadUser],
  )

  const logout = useCallback(async () => {
    await authService.logout()
    endSession()
  }, [endSession])

  const value = useMemo(
    () => ({ user, status, login, register, logout }),
    [user, status, login, register, logout],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}
