import { Minus, Plus, Trash2 } from 'lucide-react'
import { useCartStore } from '../../store/cartStore'

/**
 * CartItem — fila de producto en el carrito del POS.
 */
export default function CartItem({ item, onIncrease }) {
  const { decreaseQty, removeItem } = useCartStore()

  return (
    <div className="flex items-center gap-2 py-3 border-b border-line last:border-0 group ">
      {/* Nombre + precio unit */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ink truncate">{item.product_name}</p>
        <p className="text-xs text-muted">Bs {item.unit_price.toFixed(2)} c/u</p>
      </div>

      {/* Controles de cantidad */}
      <div className="flex items-center gap-1.5">
        <button
          aria-label={`Reducir cantidad de ${item.product_name}`}
          onClick={() => decreaseQty(item.product_id)}
          className="w-9 h-9 shrink-0 rounded-lg bg-ink/5 hover:bg-ink/5 active:bg-ink/5 flex items-center justify-center text-muted hover:text-ink transition-colors duration-100 active:scale-90"
        >
          <Minus aria-hidden="true" size={13} />
        </button>
        <span className="w-6 text-center text-sm font-bold text-ink">
          {item.quantity}
        </span>
        <button
          aria-label={`Aumentar cantidad de ${item.product_name}`}
          onClick={() => onIncrease ? onIncrease(item) : undefined}
          className="w-8 h-8 rounded-lg bg-brand-500/20 hover:bg-brand-500/40 active:bg-brand-500 flex items-center justify-center text-brand-700 hover:text-brand-700 active:text-white transition-colors duration-100 active:scale-90"
        >
          <Plus aria-hidden="true" size={13} />
        </button>
      </div>

      {/* Subtotal */}
      <p className="text-sm font-bold text-ink w-16 shrink-0 text-right">
        Bs {item.subtotal.toFixed(2)}
      </p>

      {/* Eliminar */}
      <button
        aria-label={`Quitar ${item.product_name} del carrito`}
        onClick={() => removeItem(item.product_id)}
        className="opacity-70 w-8 h-8 rounded-lg hover:bg-danger-soft0/20 flex items-center justify-center text-muted hover:text-danger transition-colors duration-150"
      >
        <Trash2 aria-hidden="true" size={14} />
      </button>
    </div>
  )
}
