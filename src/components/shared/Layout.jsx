import { Outlet } from 'react-router-dom'
import { useState } from 'react'
import Sidebar from './Sidebar'
import { Menu } from 'lucide-react'

/**
 * Layout principal con sidebar fijo en escritorio y off-canvas en móvil.
 */
export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-surface-300 relative">
      {/* Overlay para móvil */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Oculto por defecto en móvil, visible en lg */}
      <div className={`
        fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Contenido Principal */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header móvil (solo visible en pantallas pequeñas) */}
        <div className="lg:hidden flex items-center p-4 border-b border-white/8 bg-surface-200 shrink-0">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-2 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <Menu size={24} />
          </button>
          <div className="ml-3 font-bold text-white tracking-wide">Broastería Brena</div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
