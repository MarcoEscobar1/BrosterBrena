import { createContext, useContext, useState, useCallback } from 'react'
import { useCartStore } from '../store/cartStore'
import { db } from '../lib/mockDb'

const AuthContext = createContext(null)

const SESSION_KEY = 'brena_session_user_id'

export function AuthProvider({ children }) {
  const [profile, setProfile] = useState(() => {
    const savedId = localStorage.getItem(SESSION_KEY)
    const saved = savedId ? db.getProfileById(savedId) : null
    return saved?.is_active ? saved : null
  })
  const loading = false

  const loginWithUsername = useCallback(async (username, password) => {
    const result = db.loginWithUsername(username, password)
    if (result.error) {
      return { error: { message: result.error } }
    }
    const { user } = result
    localStorage.setItem(SESSION_KEY, user.id)
    setProfile(user)
    return { data: { user } }
  }, [])

  const logout = useCallback(async () => {
    localStorage.removeItem(SESSION_KEY)
    useCartStore.getState().clearCart()
    useCartStore.getState().setIsCartOpen(false)
    setProfile(null)
  }, [])

  const refreshProfile = useCallback(() => {
    if (!profile) return
    const fresh = db.getProfileById(profile.id)
    if (fresh) setProfile(fresh)
  }, [profile])

  const isAdmin    = profile?.role === 'admin'
  const isEmployee = profile?.role === 'employee'

  // Compatibilidad: "user" es el mismo profile
  const user = profile

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      isAdmin,
      isEmployee,
      loginWithUsername,
      logout,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

/* Auth provider and its hook share a module intentionally. */
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
