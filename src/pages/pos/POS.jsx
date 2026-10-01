import { useState, useEffect, useCallback } from 'react'
import { db } from '../../lib/mockDb'
import { useAuth } from '../../context/AuthContext'
import { useCartStore } from '../../store/cartStore'
import { ShoppingCart as CartIcon } from 'lucide-react'
import ProductCard from '../../components/pos/ProductCard'
import Cart from '../../components/pos/Cart'
import ReceiptModal from '../../components/pos/ReceiptModal'
import Spinner from '../../components/ui/Spinner'
import toast from 'react-hot-toast'

const CATEGORIES = [
  { key: 'plato',    label: 'Platos',    },
  { key: 'extra',    label: 'Extras',    },
  { key: 'refresco', label: 'Refrescos', },
]

export default function POS() {
  const { profile, isAdmin } = useAuth()
  const { items, isAdminSale, addItem, clearCart } = useCartStore()

  const [products,    setProducts]    = useState([])
  const [inventory,   setInventory]   = useState({})
  const [loading,     setLoading]     = useState(true)
  const [confirming,  setConfirming]  = useState(false)
  const [lastReceipt, setLastReceipt] = useState(null)
  const [showReceipt, setShowReceipt] = useState(false)
  const [isCartOpen,  setIsCartOpen]  = useState(false)

  const loadData = useCallback(() => {
    const prods = db.getProducts(true) // solo activos
    const invMap = db.getInventoryMap()
    setProducts(prods)
    setInventory(invMap)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Calcular stock disponible
  const getAvailableStock = (product) => {
    if (product.category === 'refresco') {
      // Para refrescos usamos el slug del producto (por ahora inventario no vinculado a refresco por id)
      return Infinity
    }
    if (product.chicken_pieces_required > 0) {
      const chickenStock = inventory['chicken_pieces'] || 0
      return Math.floor(chickenStock / product.chicken_pieces_required)
    }
    return Infinity
  }

  // Validar y agregar al carrito
  const handleAddItem = (product) => {
    if (product.chicken_pieces_required > 0) {
      const chickenStock    = inventory['chicken_pieces'] || 0
      const cartChickenUsed = items.reduce((acc, i) => acc + (i.chicken_pieces * i.quantity), 0)
      if (cartChickenUsed + product.chicken_pieces_required > chickenStock) {
        toast.error(`Presas insuficientes. Solo quedan ${Math.floor(chickenStock - cartChickenUsed)} disponibles.`)
        return
      }
    }
    addItem(product)
  }

  // Validar y aumentar cantidad en carrito
  const handleIncreaseQty = (item) => {
    const product = products.find(p => p.id === item.product_id)
    if (!product) return

    if (product.chicken_pieces_required > 0) {
      const chickenStock    = inventory['chicken_pieces'] || 0
      const cartChickenUsed = items.reduce((acc, i) => acc + (i.chicken_pieces * i.quantity), 0)
      if (cartChickenUsed + product.chicken_pieces_required > chickenStock) {
        toast.error(`Presas insuficientes. Solo quedan ${Math.floor(chickenStock - cartChickenUsed)} disponibles.`)
        return
      }
    }

    useCartStore.getState().increaseQty(item.product_id)
  }

  // Confirmar venta
  const handleConfirmSale = () => {
    if (items.length === 0) {
      toast.error('El carrito esta vacio')
      return
    }

    setConfirming(true)
    try {
      const cartItems = items.map(i => ({
        product_id:     i.product_id,
        product_name:   i.product_name,
        quantity:       i.quantity,
        unit_price:     i.unit_price,
        subtotal:       i.subtotal,
        chicken_pieces: i.chicken_pieces,
      }))

      const result = db.createSale({
        employee_id:   profile.id,
        is_admin_sale: isAdminSale,
        items:         cartItems,
      })

      if (result.error) {
        toast.error(result.error)
        return
      }

      setLastReceipt({
        ...result.data,
        employee_name: `${profile.first_name} ${profile.last_name}`,
        is_admin_sale: isAdminSale,
        items: cartItems,
      })

      clearCart()
      setIsCartOpen(false)
      setShowReceipt(true)
      toast.success(`Venta registrada: ${result.data.receipt_number}`)

      // Refrescar inventario
      setInventory(db.getInventoryMap())
    } catch (err) {
      toast.error('Error inesperado. Intenta de nuevo.')
    } finally {
      setConfirming(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen bg-surface-300">
        <Spinner size="lg" />
      </div>
    )
  }

  const cartTotalItems = items.reduce((acc, item) => acc + item.quantity, 0)

  return (
    <div className="flex h-full min-h-full w-full relative bg-surface-300">
      {/* Panel Central: Catalogo */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        {/* Header del POS */}
        <div className="hidden lg:flex items-center justify-between px-6 py-4 border-b border-white/8 bg-surface-200 shrink-0 shadow-sm relative z-10">
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide">Punto de Venta</h1>
            <p className="text-xs text-brand-400 uppercase tracking-widest font-medium">
              {profile?.first_name} {profile?.last_name}
            </p>
          </div>
        </div>

        {/* Grid de Productos */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 pb-24 lg:pb-6">
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-white/30">
              <p className="text-4xl mb-3 opacity-50">😶</p>
              <p className="tracking-wide uppercase text-xs font-bold">No hay productos activos</p>
            </div>
          ) : (
            <div className="flex flex-col gap-8 max-w-7xl mx-auto">
              {CATEGORIES.map(cat => {
                const catProducts = products.filter(p => p.category === cat.key)
                if (catProducts.length === 0) return null

                return (
                  <div key={cat.key}>
                    <h2 className="text-lg font-bold text-white mb-4 border-b border-white/10 pb-2 inline-flex items-center gap-2 uppercase tracking-wide">
                      {cat.label}
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 lg:gap-4">
                      {catProducts.map(product => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          stock={getAvailableStock(product)}
                          onAdd={handleAddItem}
                        />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Cart Overlay */}
      {isCartOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsCartOpen(false)}
        />
      )}

      {/* Panel Derecho: Carrito */}
      <div className={`
        fixed inset-y-0 right-0 z-50 transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0
        ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}
        shadow-2xl lg:shadow-none h-full
      `}>
        <Cart
          onConfirm={handleConfirmSale}
          confirming={confirming}
          isAdmin={isAdmin}
          onIncreaseQty={handleIncreaseQty}
          onCloseMobile={() => setIsCartOpen(false)}
        />
      </div>

      {/* Floating Cart Button (Mobile Only) */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-30 w-full max-w-sm px-4 pointer-events-none">
        <button
          onClick={() => setIsCartOpen(true)}
          className="w-full flex items-center justify-between gap-3 px-6 py-4 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white shadow-brand transition-transform active:scale-95 pointer-events-auto"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <CartIcon size={24} />
              {cartTotalItems > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center bg-white text-brand-600 rounded-full text-xs font-bold">
                  {cartTotalItems}
                </span>
              )}
            </div>
            <span className="font-bold tracking-wide">Ver Carrito</span>
          </div>
          {cartTotalItems > 0 && (
            <span className="font-bold bg-black/20 px-3 py-1 rounded-lg">
              Bs {items.reduce((a, i) => a + i.subtotal, 0).toFixed(2)}
            </span>
          )}
        </button>
      </div>

      {/* Modal de Recibo */}
      <ReceiptModal
        open={showReceipt}
        receipt={lastReceipt}
        onClose={() => setShowReceipt(false)}
      />
    </div>
  )
}
