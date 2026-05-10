import { createContext, useState, useEffect, useCallback } from 'react'
import { authApi } from '../api/auth.js'
import api from '../api/client.js'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [initialized, setInitialized] = useState(false)

  const hydrate = useCallback(async () => {
    try {
      const profile = await authApi.me()
      setUser(profile)
    } catch {
      setUser(null)
    } finally {
      setInitialized(true)
    }
  }, [])

  useEffect(() => {
    hydrate()
  }, [hydrate])

  const login = useCallback(async (credentials) => {
    await authApi.login(credentials)
    const profile = await authApi.me()
    setUser(profile)
    return profile
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } finally {
      setUser(null)
    }
  }, [])

  const logoutAllDevices = useCallback(async () => {
    try {
      await authApi.logoutAll()
    } finally {
      setUser(null)
    }
  }, [])

  const hasPermission = useCallback(
    (key) => Array.isArray(user?.permissions) && user.permissions.includes(key),
    [user]
  )

  const refetchProfile = useCallback(async () => {
    try {
      const profile = await authApi.me()
      setUser(profile)
      return profile
    } catch {
      setUser(null)
      return null
    }
  }, [])

  const register = useCallback(async (formData) => {
    const res = await api.post('/auth/register', formData).then((r) => r.data)
    return res
  }, [])

  const value = {
    user,
    loading: !initialized,
    login,
    logout,
    logoutAllDevices,
    register,
    hasPermission,
    refetchProfile,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
