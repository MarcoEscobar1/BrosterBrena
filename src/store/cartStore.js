import { create } from 'zustand'

/**
 * Zustand store del carrito del POS.
 * El carrito vive en memoria del cliente — no se persiste.
 */
export const useCartStore = create((set, get) => ({
  items:        [],
  isAdminSale:  false,
  isCartOpen:   false,

  setIsCartOpen(open) {
    set({ isCartOpen: open })
  },

  // ─── Acciones ───────────────────────────────────────────
  addItem(product) {
    const items = get().items
    const existing = items.find(i => i.product_id === product.id)
    if (existing) {
      set({
        items: items.map(i =>
          i.product_id === product.id
            ? { ...i, quantity: i.quantity + 1, subtotal: (i.quantity + 1) * i.unit_price }
            : i
        )
      })
    } else {
      set({
        items: [
          ...items,
          {
            product_id:     product.id,
            product_name:   product.name,
            quantity:       1,
            unit_price:     product.price,
            subtotal:       product.price,
            chicken_pieces: product.chicken_pieces_required,
          },
        ]
      })
    }
  },

  increaseQty(productId) {
    set({
      items: get().items.map(i =>
        i.product_id === productId
          ? { ...i, quantity: i.quantity + 1, subtotal: (i.quantity + 1) * i.unit_price }
          : i
      )
    })
  },

  decreaseQty(productId) {
    const items = get().items
    const item  = items.find(i => i.product_id === productId)
    if (!item) return
    if (item.quantity <= 1) {
      get().removeItem(productId)
      return
    }
    set({
      items: items.map(i =>
        i.product_id === productId
          ? { ...i, quantity: i.quantity - 1, subtotal: (i.quantity - 1) * i.unit_price }
          : i
      )
    })
  },

  removeItem(productId) {
    set({ items: get().items.filter(i => i.product_id !== productId) })
  },

  clearCart() {
    set({ items: [], isAdminSale: false })
  },

  setAdminSale(value) {
    set({ isAdminSale: value })
  },

  // ─── Computed ───────────────────────────────────────────
  get total() {
    return get().items.reduce((acc, i) => acc + i.subtotal, 0)
  },

  get totalItems() {
    return get().items.reduce((acc, i) => acc + i.quantity, 0)
  },

  get totalChickenPieces() {
    return get().items.reduce((acc, i) => acc + i.chicken_pieces * i.quantity, 0)
  },
}))
