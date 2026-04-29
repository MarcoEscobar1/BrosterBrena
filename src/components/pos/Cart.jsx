import { ShoppingCart, Trash2, AlertTriangle, X } from 'lucide-react'
import { useCartStore } from '../../store/cartStore'
import CartItem from './CartItem'
import Button from '../ui/Button'

/**
 * Panel del carrito del POS.
 */
export default function Cart({ onConfirm, confirming, isAdmin, onIncreaseQty, onCloseMobile }) {
  const { items, isAdminSale, setAdminSale, clearCart } = useCartStore()

  // Computed
  const total         = items.reduce((a, i) => a + i.subtotal, 0)
  const totalItems    = items.reduce((a, i) => a + i.quantity, 0)
  const totalPieces   = items.reduce((a, i) => a + i.chicken_pieces * i.quantity, 0)

  return (
    <div className="
      flex flex-col w-[85vw] sm:w-80 xl:w-96 shrink-0
      bg-surface-100 border-l border-white/8
      h-full max-w-sm lg:max-w-none
    ">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/8 bg-surface-200/50">
        <div className="flex items-center gap-2.5">
          {onCloseMobile && (
            <button 
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 -ml-1.5 text-white/40 hover:text-white rounded-lg hover:bg-white/10"
            >
              <X size={20} />
            </button>
          )}
          <ShoppingCart size={18} className="text-brand-500" />
          <h2 className="font-semibold text-white tracking-wide uppercase text-sm">Carrito</h2>
          {totalItems > 0 && (
            <span className="badge-orange text-xs px-2 py-0.5 rounded-full font-bold">
              {totalItems}
            </span>
          )}
        </div>
        {items.length > 0 && (
          <button
            onClick={clearCart}
            className="p-1.5 rounded-lg hover:bg-red-500/15 text-white/30 hover:text-red-400 transition-all duration-150"
            title="Vaciar carrito"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {/* Lista de ítems */}
      <div className="flex-1 overflow-y-auto px-5">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-white/20 py-12">
            <ShoppingCart size={40} strokeWidth={1} className="mb-3 opacity-30" />
            <p className="text-sm font-bold uppercase tracking-wide">Carrito vacío</p>
            <p className="text-xs mt-1">Toca un producto para agregarlo</p>
          </div>
        ) : (
          <div className="py-2">
            {items.map(item => (
              <CartItem key={item.product_id} item={item} onIncrease={onIncreaseQty} />
            ))}
          </div>
        )}
      </div>

      {/* Footer con resumen y botón */}
      {items.length > 0 && (
        <div className="px-5 py-6 border-t border-white/8 flex flex-col gap-4 bg-surface-200/30">
          {/* Resumen de presas */}
          {totalPieces > 0 && (
            <div className="flex items-center justify-between text-xs text-brand-400 font-medium tracking-wide uppercase">
              <span className="flex items-center gap-1.5">
                🍗 Presas
              </span>
              <span className="text-sm">{totalPieces}</span>
            </div>
          )}

          {/* Total */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-white/50 tracking-widest uppercase">TOTAL A PAGAR</span>
            <span className="text-3xl font-black text-white tracking-tight">
              Bs {total.toFixed(2)}
            </span>
          </div>

          {/* Toggle Venta Admin (solo admin) */}
          {isAdmin && (
            <label className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-400 border border-white/8 cursor-pointer group hover:bg-surface-300 transition-colors">
              <div className="relative shrink-0">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={isAdminSale}
                  onChange={e => setAdminSale(e.target.checked)}
                />
                <div className="w-10 h-5 bg-white/10 rounded-full peer peer-checked:bg-brand-500 transition-all duration-200" />
                <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200 peer-checked:translate-x-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white tracking-wide uppercase truncate">Venta Admin</p>
                <p className="text-[10px] text-white/40 uppercase tracking-widest truncate">Sin ingreso</p>
              </div>
              {isAdminSale && (
                <AlertTriangle size={15} className="text-brand-400 shrink-0" />
              )}
            </label>
          )}

          {/* Botón confirmar */}
          <Button
            variant="primary"
            size="xl"
            className="w-full uppercase tracking-widest font-black shadow-glow"
            loading={confirming}
            disabled={confirming || items.length === 0}
            onClick={onConfirm}
          >
            {confirming ? 'Procesando...' : 'Confirmar Venta'}
          </Button>
        </div>
      )}
    </div>
  )
}
