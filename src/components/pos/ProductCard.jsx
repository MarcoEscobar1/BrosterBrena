import { Plus, Check } from 'lucide-react'
export default function ProductCard({product,stock=Infinity,onAdd,quantity=0}) {
  const unavailable=stock<=0
  return <button type="button" disabled={unavailable} onClick={()=>onAdd(product)} className="product-card relative" aria-label={`Agregar ${product.name}, Bs ${Number(product.price).toFixed(2)}${quantity?`, ${quantity} en el pedido`:''}`}>
    <div className="flex items-start justify-between gap-2 w-full mb-3">
      <span className="text-xs text-muted">{unavailable?'Agotado':product.chicken_pieces_required>0?`${product.chicken_pieces_required} presas`:'Por unidad'}</span>
      {quantity>0 && <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700"><Check size={13} aria-hidden="true"/>{quantity} en pedido</span>}
    </div>
    <h3 className="font-semibold text-base leading-tight">{product.name}</h3>
    <p className="text-xs text-muted mt-1 mb-4">{product.description}</p>
    <div className="mt-auto flex items-center justify-between gap-2 w-full"><span className="font-bold text-lg tabular-nums">Bs {Number(product.price).toFixed(2)}</span><span className="w-8 h-8 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center"><Plus size={18} aria-hidden="true"/></span></div>
  </button>
}
