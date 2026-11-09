import { Outlet, NavLink, useLocation, Link } from 'react-router-dom'
import { useState, useCallback, useEffect } from 'react'
import { useDrawerFocus } from '../../hooks/useDrawerFocus'
import Sidebar from './Sidebar'
import ThemeToggle from '../ui/ThemeToggle'
import { useAuth } from '../../context/AuthContext'
import { useCartStore } from '../../store/cartStore'
import { Menu, LayoutDashboard, ShoppingCart, Receipt, Warehouse, ChevronRight } from 'lucide-react'

const TITLES = { dashboard:'Resumen', ventas:'Ventas', reportes:'Reportes', inventario:'Inventario', productos:'Productos', proveedores:'Proveedores y compras', usuarios:'Personal', pos:'Nueva venta' }
export default function Layout() {
  const [open, setOpen] = useState(false)
  const { isAdmin } = useAuth()
  const { items, setIsCartOpen } = useCartStore()
  const location = useLocation()
  const close = useCallback(()=>setOpen(false),[])
  const sidebarRef = useDrawerFocus(open,close)
  const isPos = location.pathname === '/pos'
  const parts = location.pathname.split('/').filter(Boolean)
  const title = TITLES[parts[1] || parts[0]] || 'Brena'
  const count = items.reduce((a,i)=>a+i.quantity,0)
  useEffect(()=>{document.title=`${title} | Brena`},[title])
  const bottom = isAdmin ? [
    { to:'/pos',label:'Vender',icon:ShoppingCart },{to:'/admin/dashboard',label:'Resumen',icon:LayoutDashboard},
    {to:'/admin/ventas',label:'Ventas',icon:Receipt},{to:'/admin/inventario',label:'Inventario',icon:Warehouse}
  ] : [{to:'/pos',label:'Vender',icon:ShoppingCart},{to:'/empleado/ventas',label:'Mis ventas',icon:Receipt},{to:'/empleado/inventario',label:'Inventario',icon:Warehouse}]
  return <div className="flex h-dvh overflow-hidden bg-surface-300">
    <a href="#main-content" className="skip-link">Saltar al contenido</a>
    {open && <button aria-label="Cerrar menú" className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={close} />}
    <div ref={sidebarRef} tabIndex={-1} role={open ? 'dialog' : undefined} aria-modal={open ? true : undefined} aria-label="Menú principal" className={`fixed inset-y-0 left-0 z-50 h-full transition-transform duration-200 lg:static lg:translate-x-0 ${open?'translate-x-0 visible':'-translate-x-full invisible lg:visible'}`}>
      <Sidebar onClose={close}/>
    </div>
    <main id="main-content" tabIndex={-1} className="flex-1 flex flex-col min-w-0 min-h-0 outline-offset-[-3px]">
      <header className="app-toolbar shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button aria-label="Abrir menú" aria-expanded={open} onClick={()=>setOpen(true)} className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-surface-400"><Menu size={22}/></button>
          <span className="text-subtle hidden sm:block">Broastería Brena</span><ChevronRight size={14} className="text-subtle hidden sm:block" aria-hidden="true"/>
          {parts.length>2 ? <><Link to={`/${parts[0]}/${parts[1]}`} className="text-muted hover:text-brand-700">{title}</Link><ChevronRight size={14} aria-hidden="true"/><span className="font-semibold">Detalle</span></> : <span className="font-semibold truncate">{title}</span>}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <ThemeToggle />
          <span className="hidden md:block text-xs text-muted">{new Intl.DateTimeFormat('es-BO',{weekday:'long',day:'numeric',month:'long'}).format(new Date())}</span>
          {isPos ? <button aria-label={`Ver pedido, ${count} productos`} onClick={()=>setIsCartOpen(true)} className="lg:hidden btn-secondary px-3"><ShoppingCart aria-hidden="true" size={18}/><span>{count}</span></button> : <Link to="/pos" className="btn-primary text-xs px-3"><ShoppingCart size={16} aria-hidden="true"/><span>Nueva venta</span></Link>}
        </div>
      </header>
      <div className={`app-content flex-1 min-h-0 ${isPos?'overflow-hidden':'overflow-y-auto'} pb-[calc(3.5rem+env(safe-area-inset-bottom,0px))] lg:pb-0`}><Outlet/></div>
    </main>
    <nav aria-label="Accesos rápidos" className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-surface-50 border-t border-line pb-safe"><div className="flex h-14">
      {bottom.map(({to,label,icon:Icon})=><NavLink key={to} to={to} className={({isActive})=>`bottom-nav-item ${isActive?'bottom-nav-item-active':''}`}><Icon size={20} aria-hidden="true"/><span className="text-[11px] font-semibold">{label}</span></NavLink>)}
      <button onClick={()=>setOpen(true)} className="bottom-nav-item"><Menu size={20} aria-hidden="true"/><span className="text-[11px] font-semibold">Más</span></button>
    </div></nav>
  </div>
}
