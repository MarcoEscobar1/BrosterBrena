import { useDrawerFocus } from '../../hooks/useDrawerFocus'
import { useState, useCallback } from 'react'
import { db } from '../../lib/mockDb'
import { useAuth } from '../../context/AuthContext'
import { useCartStore } from '../../store/cartStore'
import ProductCard from '../../components/pos/ProductCard'
import Cart from '../../components/pos/Cart'
import ReceiptModal from '../../components/pos/ReceiptModal'
import Spinner from '../../components/ui/Spinner'
import toast from 'react-hot-toast'
import { Search, ShoppingBag } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'

const CATEGORIES = [
  { key: 'plato',    label: 'Platos',    },
  { key: 'extra',    label: 'Extras',    },
  { key: 'refresco', label: 'Refrescos', },
]

export default function POS() {
  const { profile, isAdmin } = useAuth()
  const [params, setParams] = useSearchParams()
  const search = params.get('q') || ''
  const category = params.get('category') || 'all'
  const updateFilter = (key, value) => setParams(previous => {
    const next = new URLSearchParams(previous)
    if (value && value !== 'all') next.set(key,value); else next.delete(key)
    return next
  }, { replace: true })
  const {
    items, isAdminSale, addItem, clearCart,
    isCartOpen, setIsCartOpen
  } = useCartStore()

  const closeCart = useCallback(() => setIsCartOpen(false), [setIsCartOpen])
  const cartRef = useDrawerFocus(isCartOpen, closeCart)

  const [products]    = useState(() => db.getProducts(true))
  const [inventory,   setInventory]   = useState(() => db.getInventoryMap())
  const loading = false
  const [confirming,  setConfirming]  = useState(false)
  const [lastReceipt, setLastReceipt] = useState(null)
  const [showReceipt, setShowReceipt] = useState(false)

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
    } catch {
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

  const normalized = search.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  const filtered = products.filter(p => (category === 'all' || p.category === category) && (p.name + ' ' + p.description).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(normalized))
  return (
    <div className="pos-workspace">
      <div className="pos-catalog">
        <div className="pos-top"><h1 className="font-bold">Nueva venta</h1><p>Selecciona los productos y revisa el pedido antes de confirmar.</p></div>
        <div className="pos-tools">
          <div className="relative flex-1 min-w-[180px] max-w-md">
            <Search size={18} aria-hidden="true" className="absolute left-3.5 top-3.5 text-subtle"/>
            <input type="search" name="product-search" autoComplete="off" aria-label="Buscar productos" placeholder="Buscar un producto…" value={search} onChange={e=>updateFilter('q',e.target.value)} className="input-base pl-10"/>
          </div>
          <div className="category-tabs" role="group" aria-label="Categorías de productos">
            {[{key:'all',label:'Todos'},...CATEGORIES].map(cat=><button key={cat.key} aria-pressed={category===cat.key} onClick={()=>updateFilter('category',cat.key)} className="category-tab">{cat.label}</button>)}
          </div>
        </div>
        <div className="pos-products">
          {filtered.length === 0 ? <div className="py-16 text-center"><Search size={28} className="mx-auto mb-4 text-subtle" aria-hidden="true"/><h2 className="text-lg font-semibold">{products.length ? 'No encontramos ese producto' : 'No hay productos disponibles'}</h2><p className="text-muted mt-2">{products.length ? 'Prueba con otro nombre o revisa todas las categorías.' : 'Activa productos en el catálogo para comenzar a vender.'}</p>{products.length>0 && <button className="btn-secondary mt-5" onClick={()=>setParams({})}>Mostrar todos los productos</button>}</div> :
          <div className="space-y-7">{CATEGORIES.map(cat=>{
            const list=filtered.filter(p=>p.category===cat.key)
            if(!list.length) return null
            return <section key={cat.key} aria-label={cat.label}>
              <div className="flex items-center gap-2 mb-3"><h2 className="text-base font-semibold">{cat.label}</h2><span className="text-xs text-subtle">{list.length}</span></div>
              <div className="pos-grid">{list.map(product=><ProductCard key={product.id} product={product} stock={getAvailableStock(product)} onAdd={handleAddItem} quantity={items.find(i=>i.product_id===product.id)?.quantity || 0}/>)}</div>
            </section>
          })}</div>}
        </div>
      </div>
      {isCartOpen && <button aria-label="Cerrar pedido" className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={closeCart}/>}
      <div ref={cartRef} tabIndex={-1} role={isCartOpen?'dialog':undefined} aria-modal={isCartOpen?true:undefined} aria-label="Pedido actual" className={`fixed inset-y-0 right-0 z-50 h-full transition-transform duration-200 lg:static lg:translate-x-0 ${isCartOpen?'translate-x-0 visible':'translate-x-full invisible lg:visible'}`}>
        <Cart onConfirm={handleConfirmSale} confirming={confirming} isAdmin={isAdmin} onIncreaseQty={handleIncreaseQty} onCloseMobile={closeCart}/>
      </div>
      {cartTotalItems>0 && <div className="lg:hidden fixed bottom-[calc(4.25rem+env(safe-area-inset-bottom,0px))] left-0 right-0 z-30 px-4"><button onClick={()=>setIsCartOpen(true)} className="btn-primary w-full flex justify-between shadow-lg"><span className="flex items-center gap-2"><ShoppingBag size={18} aria-hidden="true"/>Ver pedido ({cartTotalItems})</span><span>Bs {items.reduce((a,i)=>a+i.subtotal,0).toFixed(2)}</span></button></div>}
      <ReceiptModal open={showReceipt} receipt={lastReceipt} onClose={()=>setShowReceipt(false)}/>
    </div>
  )
}
