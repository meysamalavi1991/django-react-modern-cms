import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { AuthContext } from './AuthContext'
import { authStorage } from './auth.storage'
import { authApi } from '../../modules/auth/api/auth.api'
import { usersApi } from '../../modules/users/api/users.api'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const clearSession = useCallback(() => {
    authStorage.clearTokens()
    setUser(null)
  }, [])

  const login = useCallback(async (credentials) => {
    const tokens = await authApi.login(credentials)

    if (!tokens.access || !tokens.refresh) {
      throw new Error('پاسخ ورود سرور معتبر نیست.')
    }

    authStorage.setTokens({
      access: tokens.access,
      refresh: tokens.refresh,
    })

    try {
      const currentUser = await usersApi.getMe()
      setUser(currentUser)
      return currentUser
    } catch (error) {
      clearSession()
      throw error
    }
  }, [clearSession])

  const logout = useCallback(async () => {
    const refreshToken = authStorage.getRefreshToken()

    try {
      if (refreshToken) {
        await authApi.logout(refreshToken)
      }
    } finally {
      clearSession()
    }
  }, [clearSession])

  const refreshUser = useCallback(async () => {
    if (!authStorage.getAccessToken() && !authStorage.getRefreshToken()) {
      setUser(null)
      return null
    }

    const currentUser = await usersApi.getMe()
    setUser(currentUser)
    return currentUser
  }, [])

  useEffect(() => {
    let cancelled = false

    async function restoreSession() {
      try {
        if (
          !authStorage.getAccessToken() &&
          !authStorage.getRefreshToken()
        ) {
          return
        }

        const currentUser = await usersApi.getMe()

        if (!cancelled) {
          setUser(currentUser)
        }
      } catch {
        if (!cancelled) {
          clearSession()
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    restoreSession()

    return () => {
      cancelled = true
    }
  }, [clearSession])

  useEffect(() => {
    const handleExpiredSession = () => {
      clearSession()
    }

    window.addEventListener('auth:expired', handleExpiredSession)

    return () => {
      window.removeEventListener('auth:expired', handleExpiredSession)
    }
  }, [clearSession])

  const value = useMemo(
    () => ({
      user,
      loading,
      setLoading,
      login,
      logout,
      refreshUser,
      isAuthenticated: Boolean(user),
    }),
    [user, loading, login, logout, refreshUser],
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
