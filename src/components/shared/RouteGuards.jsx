import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Spinner from '../ui/Spinner'

// ─── Guard genérico: requiere autenticación ──────────────────────────────────
export function RequireAuth() {
  const { user, loading } = useAuth()
  if (loading) return <FullPageSpinner />
  if (!user)   return <Navigate to="/login" replace />
  return <Outlet />
}

// ─── Guard: solo Admin ───────────────────────────────────────────────────────
export function RequireAdmin() {
  const { user, profile, loading } = useAuth()
  if (loading)            return <FullPageSpinner />
  if (!user)              return <Navigate to="/login" replace />
  if (!profile)           return <FullPageSpinner />   // perfil cargando en background
  if (profile.role !== 'admin') return <Navigate to="/pos" replace />
  return <Outlet />
}

// ─── Guard: solo Empleado ────────────────────────────────────────────────────
export function RequireEmployee() {
  const { user, profile, loading } = useAuth()
  if (loading)            return <FullPageSpinner />
  if (!user)              return <Navigate to="/login" replace />
  if (!profile)           return <FullPageSpinner />   // perfil cargando en background
  if (profile.role !== 'employee') return <Navigate to="/admin/dashboard" replace />
  return <Outlet />
}

// ─── Guard: redirige si ya está autenticado ──────────────────────────────────
export function RedirectIfAuth() {
  const { user, profile, loading } = useAuth()
  if (loading)  return <FullPageSpinner />
  if (!user)    return <Outlet />
  // Redirigir según rol
  if (profile?.role === 'admin')    return <Navigate to="/admin/dashboard" replace />
  if (profile?.role === 'employee') return <Navigate to="/pos"             replace />
  return <Outlet />
}

// ─── Helper UI ───────────────────────────────────────────────────────────────
function FullPageSpinner() {
  return (
    <div className="min-h-screen bg-surface-300 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Spinner size="lg" />
        <p className="text-white/40 text-sm">Cargando...</p>
      </div>
    </div>
  )
}
