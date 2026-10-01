/**
 * ProductCard — tarjeta del catálogo POS.
 * Muestra nombre, precio, presas requeridas y stock.
 * Optimizada para interacción táctil en móvil y tablet.
 */
export default function ProductCard({ product, stock = Infinity, onAdd }) {
  const categoryEmoji = {
    plato:    '🍗',
    extra:    '🍟',
    refresco: '🥤',
  }[product.category] ?? '🍽'

  const isOutOfStock = stock <= 0;

  return (
    <button
      onClick={() => {
        if (!isOutOfStock) onAdd(product)
      }}
      disabled={isOutOfStock}
      className={`product-card group relative overflow-hidden flex flex-col justify-between p-3 sm:p-4 h-full ${
        isOutOfStock ? 'opacity-50 cursor-not-allowed grayscale' : ''
      }`}
      id={`product-${product.id}`}
    >
      {/* Fondo decorativo (glassmorphism radial) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Stock badge */}
      {stock !== Infinity && (
        <div className={`absolute top-2 right-2 sm:top-2.5 sm:right-2.5 px-2 py-0.5 rounded shadow-sm text-[9px] uppercase tracking-wider font-bold ${
          isOutOfStock ? 'bg-red-500/80 text-white backdrop-blur-sm' : stock <= 5 ? 'bg-orange-500/80 text-white backdrop-blur-sm' : 'bg-black/40 text-white/70 backdrop-blur-sm'
        }`}>
          {isOutOfStock ? 'Agotado' : `${stock} disp`}
        </div>
      )}

      {/* Emoji de categoría */}
      <div className="flex justify-center items-center h-12 sm:h-14 mt-1 mb-1 sm:mb-2">
        <span className={`text-3xl sm:text-4xl transition-transform duration-200 drop-shadow-lg ${!isOutOfStock && 'group-active:scale-90 group-hover:scale-110 group-hover:-translate-y-1'}`}>
          {categoryEmoji}
        </span>
      </div>

      {/* Nombre e info */}
      <div className="flex flex-col items-center gap-0.5 sm:gap-1 w-full relative z-10">
        <p className="text-xs sm:text-sm font-bold text-white leading-tight text-center tracking-wide line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem] flex items-center justify-center">
          {product.name}
        </p>

        {/* Presas (si aplica) */}
        {product.chicken_pieces_required > 0 ? (
          <p className="text-[9px] sm:text-[10px] text-white/40 uppercase tracking-widest font-medium">
            {product.chicken_pieces_required} presa{product.chicken_pieces_required > 1 ? 's' : ''}
          </p>
        ) : (
          <p className="text-[9px] sm:text-[10px] text-transparent select-none">-</p>
        )}

        {/* Precio */}
        <div className="mt-1.5 sm:mt-2 w-full flex items-center justify-center py-1 sm:py-1.5 bg-black/40 rounded-lg border border-white/5 group-hover:bg-brand-500 group-hover:border-brand-400 group-active:bg-brand-600 transition-colors duration-200">
          <span className="text-brand-400 group-hover:text-white group-active:text-white font-black text-xs sm:text-sm tracking-wide">
            Bs {Number(product.price).toFixed(2)}
          </span>
        </div>
      </div>
    </button>
  )
}
