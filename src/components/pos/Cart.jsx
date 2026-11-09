import { ShoppingCart, Trash2, AlertTriangle, X } from 'lucide-react'
import { useCartStore } from '../../store/cartStore'
import CartItem from './CartItem'
import Button from '../ui/Button'
import Modal from '../ui/Modal'
import { useState } from 'react'

/**
 * Panel del carrito del POS.
 */
export default function Cart({ onConfirm, confirming, isAdmin, onIncreaseQty, onCloseMobile }) {
  const [discardOpen,setDiscardOpen] = useState(false)
  const { items, isAdminSale, setAdminSale, clearCart } = useCartStore()

  // Computed
  const total         = items.reduce((a, i) => a + i.subtotal, 0)
  const totalItems    = items.reduce((a, i) => a + i.quantity, 0)
  const totalPieces   = items.reduce((a, i) => a + i.chicken_pieces * i.quantity, 0)

  return (
    <div className="
      flex flex-col min-h-0 w-[100vw] sm:w-[360px] xl:w-[380px] shrink-0
      bg-surface-50 border-l border-line
      h-full max-w-full sm:max-w-sm lg:max-w-none
    ">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-line bg-surface-200/50">
        <div className="flex items-center gap-2.5">
          {onCloseMobile && (
            <button
              aria-label="Cerrar carrito"
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 -ml-1.5 text-muted hover:text-ink rounded-lg hover:bg-ink/5"
            >
              <X aria-hidden="true" size={20} />
            </button>
          )}
          <ShoppingCart aria-hidden="true" size={18} className="text-brand-500" />
          <h2 className="font-semibold text-ink tracking-normal normal-case text-sm">Pedido actual</h2>
          {totalItems > 0 && (
            <span className="badge-orange text-xs px-2 py-0.5 rounded-full font-bold">
              {totalItems}
            </span>
          )}
        </div>
        {items.length > 0 && (
          <button
            onClick={()=>setDiscardOpen(true)}
            className="p-1.5 rounded-lg hover:bg-danger-soft0/15 text-muted hover:text-danger transition-colors duration-150"
            aria-label="Vaciar pedido" title="Vaciar pedido"
          >
            <Trash2 aria-hidden="true" size={16} />
          </button>
        )}
      </div>

      <Modal open={discardOpen} onClose={()=>setDiscardOpen(false)} title="¿Vaciar el pedido?" size="sm"><p className="text-muted">Se quitarán todos los productos del pedido actual.</p><div className="flex justify-end gap-2 mt-6"><Button variant="secondary" onClick={()=>setDiscardOpen(false)}>Conservar pedido</Button><Button variant="danger" onClick={()=>{clearCart();setDiscardOpen(false)}}>Vaciar pedido</Button></div></Modal>
      {/* Lista de ítems */}
      <div className="flex-1 min-h-0 overflow-y-auto px-5">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted py-12">
            <ShoppingCart aria-hidden="true" size={40} strokeWidth={1} className="mb-3 opacity-30" />
            <p className="text-sm font-bold normal-case tracking-normal">Tu pedido empieza aquí</p>
            <p className="text-xs mt-1">Selecciona un producto del catálogo.</p>
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
        <div className="px-4 sm:px-5 py-4 sm:py-6 border-t border-line flex flex-col gap-3 sm:gap-4 bg-surface-200/30 pb-[max(1rem,env(safe-area-inset-bottom,0px))]">
          {/* Resumen de presas */}
          {totalPieces > 0 && (
            <div className="flex items-center justify-between text-xs text-brand-700 font-medium tracking-normal normal-case">
              <span className="flex items-center gap-1.5">
                Presas
              </span>
              <span className="text-sm">{totalPieces}</span>
            </div>
          )}

          {/* Total */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-muted tracking-normal normal-case">Total a pagar</span>
            <span className="text-3xl font-bold text-ink tracking-tight">
              Bs {total.toFixed(2)}
            </span>
          </div>

          {/* Toggle Consumo interno (solo admin) */}
          {isAdmin && (
            <label className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-400 border border-line cursor-pointer group hover:bg-surface-300 transition-colors">
              <div className="relative shrink-0">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={isAdminSale}
                  onChange={e => setAdminSale(e.target.checked)}
                />
                <div className="w-10 h-5 bg-ink/5 rounded-full peer peer-checked:bg-brand-500 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-700 transition-colors duration-200" />
                <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-colors duration-200 peer-checked:translate-x-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-ink tracking-normal normal-case truncate">Venta Admin</p>
                <p className="text-[10px] text-muted normal-case tracking-normal truncate">Descuenta stock, sin registrar ingreso</p>
              </div>
              {isAdminSale && (
                <AlertTriangle aria-hidden="true" size={15} className="text-brand-700 shrink-0" />
              )}
            </label>
          )}

          {/* Botón confirmar */}
          <Button
            variant="primary"
            size="xl"
            className="w-full"
            loading={confirming}
            disabled={confirming || items.length === 0}
            onClick={onConfirm}
          >
            {confirming ? 'Registrando…' : isAdminSale ? 'Registrar consumo' : 'Confirmar venta'}
          </Button>
        </div>
      )}
    </div>
  )
}
