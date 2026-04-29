import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { RedirectIfAuth, RequireAuth, RequireAdmin, RequireEmployee } from './components/shared/RouteGuards'
import Layout from './components/shared/Layout'

// Pages
import Login from './pages/Login'

// Admin pages
import Dashboard    from './pages/admin/Dashboard'
import Ventas       from './pages/admin/Ventas'
import VentaDetalle from './pages/admin/VentaDetalle'
import Reportes     from './pages/admin/Reportes'
import Inventario   from './pages/admin/Inventario'
import Productos    from './pages/admin/Productos'
import Proveedores  from './pages/admin/Proveedores'
import ProveedorDetalle  from './pages/admin/ProveedorDetalle'
import ProveedorCompras  from './pages/admin/ProveedorCompras'
import Usuarios     from './pages/admin/Usuarios'

// Shared
import POS from './pages/pos/POS'

// Employee pages
import MisVentas       from './pages/employee/MisVentas'
import InventarioEmpleado from './pages/employee/Inventario'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          {/* ── Login ───────────────────────────────────────── */}
          <Route element={<RedirectIfAuth />}>
            <Route path="/login" element={<Login />} />
          </Route>

          {/* ── Raíz: redirigir según rol ────────────────────── */}
          <Route element={<RequireAuth />}>
            <Route path="/" element={<Navigate to="/pos" replace />} />
          </Route>

          {/* ── Rutas ADMIN ──────────────────────────────────── */}
          <Route element={<RequireAdmin />}>
            <Route element={<Layout />}>
              <Route path="/admin/dashboard"            element={<Dashboard />} />
              <Route path="/admin/ventas"               element={<Ventas />} />
              <Route path="/admin/ventas/:id"           element={<VentaDetalle />} />
              <Route path="/admin/reportes"             element={<Reportes />} />
              <Route path="/admin/inventario"           element={<Inventario />} />
              <Route path="/admin/productos"            element={<Productos />} />
              <Route path="/admin/proveedores"          element={<Proveedores />} />
              <Route path="/admin/proveedores/nuevo"    element={<ProveedorDetalle />} />
              <Route path="/admin/proveedores/:id"      element={<ProveedorDetalle />} />
              <Route path="/admin/proveedores/:id/compras" element={<ProveedorCompras />} />
              <Route path="/admin/usuarios"             element={<Usuarios />} />
            </Route>
          </Route>

          {/* ── Ruta POS (admin + empleado) ──────────────────── */}
          <Route element={<RequireAuth />}>
            <Route element={<Layout />}>
              <Route path="/pos" element={<POS />} />
            </Route>
          </Route>

          {/* ── Rutas EMPLEADO ───────────────────────────────── */}
          <Route element={<RequireEmployee />}>
            <Route element={<Layout />}>
              <Route path="/empleado/ventas"     element={<MisVentas />} />
              <Route path="/empleado/ventas/:id" element={<VentaDetalle />} />
              <Route path="/empleado/inventario" element={<InventarioEmpleado />} />
            </Route>
          </Route>

          {/* ── Catch-all ────────────────────────────────────── */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>

        {/* Toast notifications globales */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#252525',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#22c55e', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#fff' },
              duration: 6000,
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  )
}
