import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import Sidebar from './Sidebar'
import { useAuth } from '../../context/AuthContext'
import { useCartStore } from '../../store/cartStore'
import {
  Menu, LayoutDashboard, ShoppingCart, Receipt,
  Warehouse, LogOut, X
} from 'lucide-react'

const ADMIN_BOTTOM = [
  { to: '/admin/dashboard', label: 'Inicio',    icon: LayoutDashboard },
  { to: '/pos',             label: 'POS',        icon: ShoppingCart    },
  { to: '/admin/ventas',    label: 'Ventas',     icon: Receipt         },
  { to: '/admin/inventario',label: 'Stock',      icon: Warehouse       },
]

const EMP_BOTTOM = [
  { to: '/pos',              label: 'POS',        icon: ShoppingCart },
  { to: '/empleado/ventas',  label: 'Mis Ventas', icon: Receipt      },
  { to: '/empleado/inventario', label: 'Stock',   icon: Warehouse    },
]

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { isAdmin, logout } = useAuth()
  const { items, setIsCartOpen } = useCartStore()
  const navigate = useNavigate()
  const location = useLocation()

  const bottomItems = isAdmin ? ADMIN_BOTTOM : EMP_BOTTOM
  const isPos = location.pathname === '/pos'
  const totalCartCount = items.reduce((acc, i) => acc + i.quantity, 0)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen h-dvh overflow-hidden bg-surface-300 relative">

      {/* ── Overlay sidebar (móvil) ─────────────────────────── */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar (oculto en móvil, visible en lg) ─────────── */}
      <div className={`
        fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out
        lg:static lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* ── Contenido Principal ───────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">

        {/* Header móvil */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-white/8 bg-surface-200 shrink-0 pt-safe">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-1 text-white/70 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
            >
              <Menu size={22} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-brand-500/15 border border-brand-500/30 flex items-center justify-center overflow-hidden">
                <img
                  src="/Logo.jpg"
                  alt="Brena"
                  className="w-full h-full object-cover"
                  onError={e => { e.target.style.display='none'; e.target.parentElement.innerHTML='<span class="text-brand-400 text-[10px] font-bold">BB</span>' }}
                />
              </div>
              <span className="font-bold text-white text-sm tracking-wide">Broastería Brena</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {isPos && (
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-white/70 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
                title="Ver Carrito"
              >
                <ShoppingCart size={20} />
                {totalCartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-brand-500 text-white rounded-full text-[10px] font-black flex items-center justify-center shadow">
                    {totalCartCount}
                  </span>
                )}
              </button>
            )}
            <button
              onClick={handleLogout}
              className="p-2 text-white/40 hover:text-red-400 rounded-xl hover:bg-red-500/10 transition-colors"
              title="Cerrar sesión"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* Contenido scrollable con espacio para bottom nav en móvil */}
        <div className={`flex-1 ${isPos ? 'overflow-hidden' : 'overflow-y-auto'} pb-[calc(3.5rem+env(safe-area-inset-bottom,0px))] lg:pb-0`}>
          <Outlet />
        </div>
      </main>

      {/* ── Bottom Navigation (solo móvil) ───────────────────── */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-surface-100 border-t border-white/10 pb-safe">
        <div className="flex items-stretch h-14">
          {bottomItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/pos'}
              className={({ isActive }) =>
                `bottom-nav-item ${isActive ? 'bottom-nav-item-active' : ''}`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                    {to === '/pos' && totalCartCount > 0 && (
                      <span className="absolute -top-1 -right-2.5 min-w-4 h-4 px-1 bg-brand-500 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow">
                        {totalCartCount}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-semibold truncate">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
