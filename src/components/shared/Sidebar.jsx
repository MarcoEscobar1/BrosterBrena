import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { LayoutDashboard, ShoppingCart, Package, Warehouse, Truck, BarChart3, Users, Receipt, LogOut, X } from 'lucide-react'

const ADMIN_GROUPS = [
  { label: 'Operación diaria', items: [
    { to: '/pos', label: 'Nueva venta', icon: ShoppingCart },
    { to: '/admin/dashboard', label: 'Resumen', icon: LayoutDashboard },
    { to: '/admin/ventas', label: 'Ventas', icon: Receipt },
  ] },
  { label: 'Productos y abastecimiento', items: [
    { to: '/admin/productos', label: 'Productos', icon: Package },
    { to: '/admin/inventario', label: 'Inventario', icon: Warehouse },
    { to: '/admin/proveedores', label: 'Proveedores y compras', icon: Truck },
  ] },
  { label: 'Administración', items: [
    { to: '/admin/reportes', label: 'Reportes', icon: BarChart3 },
    { to: '/admin/usuarios', label: 'Personal', icon: Users },
  ] },
]
const EMP_GROUPS = [{ label: 'Operación diaria', items: [
  { to: '/pos', label: 'Nueva venta', icon: ShoppingCart },
  { to: '/empleado/ventas', label: 'Mis ventas', icon: Receipt },
  { to: '/empleado/inventario', label: 'Inventario', icon: Warehouse },
] }]
export default function Sidebar({ onClose }) {
  const { profile, isAdmin, logout } = useAuth()
  const navigate = useNavigate()
  return (
    <aside className="flex flex-col w-64 h-full bg-surface-50 border-r border-line shrink-0">
      <div className="flex items-center justify-between px-6 h-[86px] shrink-0">
        <NavLink to={isAdmin ? '/admin/dashboard' : '/pos'} onClick={onClose} className="flex items-center gap-3" aria-label="Brena, inicio">
          <img src="/Logo.jpg" alt="" width="44" height="44" className="rounded-lg" />
          <div><span className="text-xl font-bold tracking-tight text-brand-700" translate="no">Brena</span><p className="text-xs text-muted">Broastería</p></div>
        </NavLink>
        <button onClick={onClose} aria-label="Cerrar menú" className="lg:hidden p-2 rounded-lg hover:bg-surface-400"><X aria-hidden="true" size={20} /></button>
      </div>
      <nav aria-label="Navegación principal" className="flex-1 overflow-y-auto px-4 pb-6">
        {(isAdmin ? ADMIN_GROUPS : EMP_GROUPS).map(group => <div key={group.label}>
          <p className="nav-group-title">{group.label}</p>
          <ul className="space-y-1">{group.items.map(({to,label,icon:Icon}) => <li key={to}>
            <NavLink to={to} onClick={onClose} className={({isActive})=>`nav-item ${isActive ? 'nav-item-active' : ''}`}>
              <Icon size={19} strokeWidth={1.8} aria-hidden="true" /><span>{label}</span>
            </NavLink>
          </li>)}</ul>
        </div>)}
      </nav>
      <div className="border-t border-line p-4">
        <div className="flex items-center gap-3 p-2 mb-2">
          <span className="w-9 h-9 rounded-full bg-surface-400 flex items-center justify-center font-semibold text-muted">{profile?.first_name?.[0]}</span>
          <div className="min-w-0"><p className="font-semibold truncate">{profile?.first_name} {profile?.last_name}</p><p className="text-xs text-muted">{isAdmin ? 'Administrador' : 'Empleado'}</p></div>
        </div>
        <button onClick={async()=>{await logout(); navigate('/login')}} className="nav-item w-full"><LogOut size={18} aria-hidden="true" />Cerrar sesión</button>
      </div>
    </aside>
  )
}
