import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Warehouse,
  Truck,
  BarChart3,
  Users,
  Receipt,
  LogOut,
  ChevronRight,
  X
} from 'lucide-react'

const adminNavItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/pos', label: 'POS', icon: ShoppingCart },
  { to: '/admin/ventas', label: 'Ventas', icon: Receipt },
  { to: '/admin/productos', label: 'Productos', icon: Package },
  { to: '/admin/inventario', label: 'Inventario', icon: Warehouse },
  { to: '/admin/proveedores', label: 'Proveedores', icon: Truck },
  { to: '/admin/reportes', label: 'Reportes', icon: BarChart3 },
  { to: '/admin/usuarios', label: 'Usuarios', icon: Users },
]

const employeeNavItems = [
  { to: '/pos', label: 'POS', icon: ShoppingCart },
  { to: '/empleado/ventas', label: 'Mis Ventas', icon: Receipt },
  { to: '/empleado/inventario', label: 'Inventario', icon: Warehouse },
]

export default function Sidebar({ onClose }) {
  const { profile, isAdmin, logout } = useAuth()
  const navigate = useNavigate()

  const navItems = isAdmin ? adminNavItems : employeeNavItems

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const handleNavClick = () => {
    if (onClose) onClose()
  }

  return (
    <aside className="
      flex flex-col w-64 min-h-screen
      bg-surface-100 border-r border-white/8
      shrink-0
    ">
      {/* Logo / Branding */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-white/8 relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center overflow-hidden shrink-0 shadow-brand">
            <img src="/Logo.jpg" alt="Brena" className="w-full h-full object-cover" onError={(e) => {
              e.target.style.display = 'none'
              e.target.parentElement.innerHTML = '<span class="text-brand-400 text-xs font-bold">BB</span>'
            }} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-white truncate uppercase tracking-widest text-brand-500">Brena</p>
          </div>
        </div>

        {/* Botón cerrar (solo móvil) */}
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-white/40 hover:text-white rounded-lg hover:bg-white/10"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 overflow-y-auto">
        <p className="px-3 mb-3 text-[10px] font-bold uppercase tracking-widest text-white/30">Menú Principal</p>
        <ul className="flex flex-col gap-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `nav-item group ${isActive ? 'nav-item-active' : ''}`
                }
                end={to === '/pos'}
              >
                <Icon size={18} className="shrink-0" />
                <span className="font-medium">{label}</span>
                <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* User info + Logout */}
      <div className="px-3 py-4 border-t border-white/8 bg-surface-200/50">
        <div className="flex items-center gap-3 px-3 py-2.5 mb-2 rounded-xl bg-black/20 border border-white/5">
          <div className="w-9 h-9 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-brand-500">
              {profile?.first_name?.[0]?.toUpperCase() ?? '?'}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-white truncate">
              {profile?.first_name} {profile?.last_name}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="nav-item w-full text-white/50 hover:text-red-400 hover:bg-red-500/10 group"
        >
          <LogOut size={16} className="group-hover:translate-x-1 transition-transform" />
          <span className="font-medium text-xs uppercase tracking-wider">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  )
}
