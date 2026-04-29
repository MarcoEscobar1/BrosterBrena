import { Minus, Plus, Trash2 } from 'lucide-react'
import { useCartStore } from '../../store/cartStore'

/**
 * CartItem — fila de producto en el carrito del POS.
 */
export default function CartItem({ item, onIncrease }) {
  const { decreaseQty, removeItem } = useCartStore()

  return (
    <div className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0 group animate-fade-in">
      {/* Nombre + precio unit */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{item.product_name}</p>
        <p className="text-xs text-white/40">Bs {item.unit_price.toFixed(2)} c/u</p>
      </div>

      {/* Controles de cantidad */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => decreaseQty(item.product_id)}
          className="w-7 h-7 rounded-lg bg-white/8 hover:bg-white/15 flex items-center justify-center text-white/60 hover:text-white transition-all duration-100 active:scale-90"
        >
          <Minus size={12} />
        </button>
        <span className="w-7 text-center text-sm font-bold text-white">
          {item.quantity}
        </span>
        <button
          onClick={() => onIncrease ? onIncrease(item) : undefined}
          className="w-7 h-7 rounded-lg bg-brand-500/20 hover:bg-brand-500/40 flex items-center justify-center text-brand-400 hover:text-brand-300 transition-all duration-100 active:scale-90"
        >
          <Plus size={12} />
        </button>
      </div>

      {/* Subtotal */}
      <p className="text-sm font-bold text-white w-16 text-right">
        Bs {item.subtotal.toFixed(2)}
      </p>

      {/* Eliminar */}
      <button
        onClick={() => removeItem(item.product_id)}
        className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg hover:bg-red-500/20 flex items-center justify-center text-white/30 hover:text-red-400 transition-all duration-150"
      >
        <Trash2 size={13} />
      </button>
    </div>
  )
}
