import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // Ref para evitar que una query colgada de una sesión anterior
  // sobreescriba el estado después de cerrar sesión.
  const activeUserRef = useRef(null)

  const loadProfile = useCallback(async (authUser) => {
    if (!authUser) {
      setProfile(null)
      return
    }

    activeUserRef.current = authUser.id

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single()

    // Si el usuario cambió mientras esperábamos, ignorar el resultado
    if (activeUserRef.current !== authUser.id) return

    if (error || !data) {
      setProfile(null)
      return
    }

    if (!data.is_active) {
      await supabase.auth.signOut().catch(() => {})
      setUser(null)
      setProfile(null)
      return
    }

    setProfile(data)
  }, [])

  useEffect(() => {
    let mounted = true

    // ── Paso 1: resolver el usuario lo más rápido posible ──────────────────
    // getSession() lee de localStorage (sincrónico en la práctica) y solo
    // intenta el refresh si el access token expiró. Lo usamos SOLO para
    // desbloquear loading=false cuanto antes.
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (!mounted) return
        const authUser = session?.user ?? null
        setUser(authUser)
        setLoading(false)          // ← desbloquear UI YA
        loadProfile(authUser)      // ← cargar perfil en segundo plano (no bloqueante)
      })
      .catch(() => {
        if (!mounted) return
        setUser(null)
        setProfile(null)
        setLoading(false)
      })

    // ── Paso 2: escuchar cambios posteriores (login, logout, refresh) ───────
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return
        const authUser = session?.user ?? null
        setUser(authUser)
        if (!authUser) {
          activeUserRef.current = null
          setProfile(null)
        } else {
          loadProfile(authUser)
        }
        // No tocamos loading aquí: ya fue resuelto por getSession()
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [loadProfile])

  const loginWithUsername = async (username, password) => {
    const { data: fnData, error: fnError } = await supabase.functions.invoke(
      'get-email-by-username',
      { body: { username } }
    )
    if (fnError || !fnData?.email) {
      return { error: { message: 'Usuario o contraseña incorrectos' } }
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email:    fnData.email,
      password: password,
    })
    if (error) {
      return { error: { message: 'Usuario o contraseña incorrectos' } }
    }
    return { data }
  }

  const logout = async () => {
    activeUserRef.current = null
    try {
      await supabase.auth.signOut()
    } catch (e) {
      // Ignoring error
    } finally {
      setUser(null)
      setProfile(null)
    }
  }

  const isAdmin    = profile?.role === 'admin'
  const isEmployee = profile?.role === 'employee'

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      isAdmin,
      isEmployee,
      loginWithUsername,
      logout,
      refreshProfile: () => loadProfile(user),
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
