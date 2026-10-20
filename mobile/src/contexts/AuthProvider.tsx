import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { authService } from '../services/authService'
import { biometricService } from '../services/biometricService'
import { onSessionExpired } from '../services/client'
import { tokenStorage } from '../services/tokenStorage'
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
    const startSession = async () => {
      const [savedSession, biometricLock] = await Promise.all([
        tokenStorage.getRefreshToken(),
        biometricService.isEnabled(),
      ])
      if (savedSession && biometricLock && (await biometricService.isAvailable())) {
        setStatus('locked')
        return
      }
      await authService.restoreSession()
      await loadUser()
    }

    startSession().catch(endSession)
    return onSessionExpired(endSession)
  }, [endSession, loadUser])

  const unlockWithBiometrics = useCallback(async () => {
    if (!(await biometricService.authenticate())) return false
    try {
      await authService.restoreSession()
      await loadUser()
      return true
    } catch (error) {
      await authService.logout()
      endSession()
      throw error
    }
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
    () => ({ user, status, login, register, logout, unlockWithBiometrics }),
    [user, status, login, register, logout, unlockWithBiometrics],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}
