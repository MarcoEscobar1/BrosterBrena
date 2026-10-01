/**
 * mockDb.js — Base de datos local (reemplaza Supabase)
 * Persiste en localStorage. Todos los datos son ficticios para demo.
 */

// ─── UUID simple ───────────────────────────────────────────────────────────────
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const save = (key, data) => {
  try { localStorage.setItem('brena_' + key, JSON.stringify(data)) } catch {}
}
const load = (key, fallback) => {
  try {
    const raw = localStorage.getItem('brena_' + key)
    return raw ? JSON.parse(raw) : fallback
  } catch { return fallback }
}

// ─── Estado inicial (seed) ────────────────────────────────────────────────────
const SEED_PROFILES = [
  {
    id: 'admin-uuid-001',
    username: 'admin',
    password: 'admin123',
    first_name: 'Administrador',
    last_name: 'Brena',
    phone: '77700001',
    role: 'admin',
    is_active: true,
    created_at: new Date('2024-01-01').toISOString(),
  },
  {
    id: 'emp-uuid-001',
    username: 'empleado',
    password: 'empleado123',
    first_name: 'Maria',
    last_name: 'Lopez',
    phone: '77700002',
    role: 'employee',
    is_active: true,
    created_at: new Date('2024-01-15').toISOString(),
  },
  {
    id: 'emp-uuid-002',
    username: 'juan',
    password: 'juan123',
    first_name: 'Juan',
    last_name: 'Mamani',
    phone: '77700003',
    role: 'employee',
    is_active: true,
    created_at: new Date('2024-02-01').toISOString(),
  },
]

const SEED_PRODUCTS = [
  { id: 'prod-001', name: 'Economico', description: '2 presas + refresco', price: 22, category: 'plato', chicken_pieces_required: 2, is_active: true },
  { id: 'prod-002', name: 'Personal', description: '3 presas + refresco', price: 30, category: 'plato', chicken_pieces_required: 3, is_active: true },
  { id: 'prod-003', name: 'Familiar Pequeno', description: '6 presas + 2 refrescos', price: 55, category: 'plato', chicken_pieces_required: 6, is_active: true },
  { id: 'prod-004', name: 'Familiar Grande', description: '10 presas + 3 refrescos', price: 90, category: 'plato', chicken_pieces_required: 10, is_active: true },
  { id: 'prod-005', name: 'Presa Extra', description: 'Presa adicional', price: 8, category: 'extra', chicken_pieces_required: 1, is_active: true },
  { id: 'prod-006', name: 'Papas Fritas', description: 'Porcion de papas', price: 10, category: 'extra', chicken_pieces_required: 0, is_active: true },
  { id: 'prod-007', name: 'Coca-Cola', description: 'Botella 500ml', price: 7, category: 'refresco', chicken_pieces_required: 0, is_active: true },
  { id: 'prod-008', name: 'Pepsi', description: 'Botella 500ml', price: 7, category: 'refresco', chicken_pieces_required: 0, is_active: true },
  { id: 'prod-009', name: 'Agua', description: 'Botella 500ml', price: 4, category: 'refresco', chicken_pieces_required: 0, is_active: true },
  { id: 'prod-010', name: 'Singani', description: 'Bebida local', price: 5, category: 'refresco', chicken_pieces_required: 0, is_active: true },
]

const SEED_INVENTORY = [
  { id: 'inv-001', slug: 'chicken_pieces', name: 'Presas de Pollo', quantity: 120, min_stock: 20, unit: 'presa' },
  { id: 'inv-002', slug: 'coca_cola', name: 'Coca-Cola', quantity: 48, min_stock: 12, unit: 'botella' },
  { id: 'inv-003', slug: 'pepsi', name: 'Pepsi', quantity: 36, min_stock: 12, unit: 'botella' },
  { id: 'inv-004', slug: 'agua', name: 'Agua', quantity: 24, min_stock: 6, unit: 'botella' },
  { id: 'inv-005', slug: 'singani', name: 'Singani', quantity: 18, min_stock: 6, unit: 'botella' },
]

const SEED_SUPPLIERS = [
  { id: 'sup-001', first_name: 'Carlos', last_name: 'Mamani', phone: '77711001', description: 'Proveedor de pollos del mercado central', is_active: true, created_at: new Date('2024-01-01').toISOString() },
  { id: 'sup-002', first_name: 'Rosa', last_name: 'Quispe', phone: '77711002', description: 'Distribuidora de bebidas', is_active: true, created_at: new Date('2024-01-05').toISOString() },
]

function generateSeedSales(profiles, products) {
  const sales = []
  const saleItems = []
  const now = new Date()

  for (let d = 6; d >= 0; d--) {
    const dayDate = new Date(now)
    dayDate.setDate(now.getDate() - d)
    const numSales = Math.floor(Math.random() * 8) + 3

    for (let s = 0; s < numSales; s++) {
      const hour = 9 + Math.floor(Math.random() * 11)
      const min = Math.floor(Math.random() * 60)
      const saleDate = new Date(dayDate)
      saleDate.setHours(hour, min, 0, 0)

      const empId = s % 3 === 0 ? 'admin-uuid-001' : (s % 2 === 0 ? 'emp-uuid-001' : 'emp-uuid-002')
      const isAdmin = s % 7 === 0
      const receiptNum = 'REC-' + String(saleDate.getTime()).slice(-6) + '-' + String(s).padStart(3, '0')
      const saleId = 'sale-' + saleDate.getTime() + '-' + s

      const platosDisp = products.filter(p => p.is_active && p.category === 'plato')
      const productCount = Math.floor(Math.random() * 2) + 1
      const chosen = platosDisp.sort(() => Math.random() - 0.5).slice(0, productCount)

      let total = 0
      chosen.forEach(p => {
        const qty = 1
        const subtotal = qty * p.price
        total += subtotal
        saleItems.push({
          id: 'item-' + saleId + '-' + p.id,
          sale_id: saleId,
          product_id: p.id,
          product_name: p.name,
          quantity: qty,
          unit_price: p.price,
          subtotal,
          chicken_pieces: p.chicken_pieces_required * qty,
        })
      })

      sales.push({
        id: saleId,
        receipt_number: receiptNum,
        employee_id: empId,
        is_admin_sale: isAdmin,
        total_amount: total,
        created_at: saleDate.toISOString(),
      })
    }
  }

  return { sales, saleItems }
}

// ─── Inicializar / Cargar estado ──────────────────────────────────────────────
let _profiles           = load('profiles',              SEED_PROFILES)
let _products           = load('products',              SEED_PRODUCTS)
let _inventory          = load('inventory',             SEED_INVENTORY)
let _suppliers          = load('suppliers',             SEED_SUPPLIERS)
let _movements          = load('movements',             [])
let _purchaseOrders     = load('purchase_orders',       [])
let _purchaseOrderItems = load('purchase_order_items',  [])

let _sales     = []
let _saleItems = []

if (!load('sales_seeded', false)) {
  const seeded = generateSeedSales(SEED_PRODUCTS, SEED_PRODUCTS)
  _sales     = seeded.sales
  _saleItems = seeded.saleItems
  save('sales_seeded', true)
  save('sales',      _sales)
  save('sale_items', _saleItems)
} else {
  _sales     = load('sales',      [])
  _saleItems = load('sale_items', [])
}

// ─── Funciones de persistencia ────────────────────────────────────────────────
const persist = () => {
  save('profiles',              _profiles)
  save('products',              _products)
  save('inventory',             _inventory)
  save('suppliers',             _suppliers)
  save('movements',             _movements)
  save('sales',                 _sales)
  save('sale_items',            _saleItems)
  save('purchase_orders',       _purchaseOrders)
  save('purchase_order_items',  _purchaseOrderItems)
}

// ─── API pública ──────────────────────────────────────────────────────────────
export const db = {
  // ── Auth ──────────────────────────────────────────────────
  loginWithUsername(username, password) {
    const user = _profiles.find(
      p => p.username === username && p.password === password && p.is_active
    )
    if (!user) return { error: 'Usuario o contrasena incorrectos' }
    return { user }
  },

  getProfileById(id) {
    return _profiles.find(p => p.id === id) ?? null
  },

  // ── Profiles ──────────────────────────────────────────────
  getProfiles() {
    return [..._profiles]
  },

  createProfile({ first_name, last_name, phone, username, role, password }) {
    if (_profiles.find(p => p.username === username)) {
      return { error: 'El nombre de usuario ya esta en uso' }
    }
    const newProfile = {
      id: uuidv4(),
      first_name,
      last_name,
      phone,
      username,
      role,
      password: password || 'changeme',
      is_active: true,
      created_at: new Date().toISOString(),
    }
    _profiles.push(newProfile)
    persist()
    return { data: newProfile }
  },

  toggleProfileActive(id) {
    const p = _profiles.find(p => p.id === id)
    if (!p) return { error: 'No encontrado' }
    p.is_active = !p.is_active
    persist()
    return { data: p }
  },

  // ── Products ──────────────────────────────────────────────
  getProducts(onlyActive = false) {
    const list = onlyActive ? _products.filter(p => p.is_active) : [..._products]
    return list.sort((a, b) => {
      if (a.category !== b.category) return a.category.localeCompare(b.category)
      return a.name.localeCompare(b.name)
    })
  },

  createProduct(data) {
    const product = { id: uuidv4(), ...data, created_at: new Date().toISOString() }
    _products.push(product)
    persist()
    return { data: product }
  },

  updateProduct(id, data) {
    const idx = _products.findIndex(p => p.id === id)
    if (idx === -1) return { error: 'No encontrado' }
    _products[idx] = { ..._products[idx], ...data }
    persist()
    return { data: _products[idx] }
  },

  // ── Inventory ─────────────────────────────────────────────
  getInventory() {
    return [..._inventory].sort((a, b) => a.name.localeCompare(b.name))
  },

  getInventoryMap() {
    const map = {}
    _inventory.forEach(i => { map[i.slug] = i.quantity })
    return map
  },

  updateInventoryItem(id, data) {
    const idx = _inventory.findIndex(i => i.id === id)
    if (idx === -1) return { error: 'No encontrado' }
    _inventory[idx] = { ..._inventory[idx], ...data }
    persist()
    return { data: _inventory[idx] }
  },

  addInventoryMovement({ item_id, movement_type, quantity_change, notes, created_by }) {
    const mov = {
      id: uuidv4(),
      item_id,
      movement_type,
      quantity_change,
      notes: notes ?? null,
      created_by,
      created_at: new Date().toISOString(),
    }
    _movements.push(mov)
    persist()
    return { data: mov }
  },

  getMovements(limit) {
    const lim = limit ?? 50
    return _movements
      .slice()
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, lim)
      .map(m => ({
        ...m,
        inventory_items: _inventory.find(i => i.id === m.item_id) ?? null,
        profiles: _profiles.find(p => p.id === m.created_by) ?? null,
      }))
  },

  // ── Suppliers ─────────────────────────────────────────────
  getSuppliers() {
    return [..._suppliers].sort((a, b) => a.first_name.localeCompare(b.first_name))
  },

  getActiveSuppliers() {
    return _suppliers.filter(s => s.is_active).sort((a, b) => a.first_name.localeCompare(b.first_name))
  },

  getSupplierById(id) {
    return _suppliers.find(s => s.id === id) ?? null
  },

  createSupplier(data) {
    const supplier = { id: uuidv4(), ...data, is_active: true, created_at: new Date().toISOString() }
    _suppliers.push(supplier)
    persist()
    return { data: supplier }
  },

  updateSupplier(id, data) {
    const idx = _suppliers.findIndex(s => s.id === id)
    if (idx === -1) return { error: 'No encontrado' }
    _suppliers[idx] = { ..._suppliers[idx], ...data }
    persist()
    return { data: _suppliers[idx] }
  },

  toggleSupplierActive(id) {
    const s = _suppliers.find(s => s.id === id)
    if (!s) return { error: 'No encontrado' }
    s.is_active = !s.is_active
    persist()
    return { data: s }
  },

  // ── Purchase Orders ────────────────────────────────────────
  registerPurchase({ supplier_id, chickens, notes, created_by }) {
    const pieces = chickens * 10
    const chickenInv = _inventory.find(i => i.slug === 'chicken_pieces')
    if (chickenInv) {
      chickenInv.quantity += pieces
    }

    const orderId = uuidv4()
    const order = {
      id: orderId,
      supplier_id,
      notes: notes ?? null,
      created_by,
      created_at: new Date().toISOString(),
    }
    const orderItem = {
      id: uuidv4(),
      purchase_order_id: orderId,
      quantity: pieces,
      notes: chickens + ' pollos x 10 presas',
    }

    _purchaseOrders.push(order)
    _purchaseOrderItems.push(orderItem)

    if (chickenInv) {
      this.addInventoryMovement({
        item_id: chickenInv.id,
        movement_type: 'purchase',
        quantity_change: pieces,
        notes: notes || ('Compra: ' + chickens + ' pollos'),
        created_by,
      })
    }

    persist()
    return { data: { pieces_added: pieces, chickens_added: chickens } }
  },

  getPurchaseOrdersBySupplier(supplier_id) {
    return _purchaseOrders
      .filter(o => o.supplier_id === supplier_id)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .map(o => ({
        ...o,
        purchase_order_items: _purchaseOrderItems.filter(i => i.purchase_order_id === o.id),
        profiles: _profiles.find(p => p.id === o.created_by) ?? null,
      }))
  },

  // ── Sales ─────────────────────────────────────────────────
  createSale({ employee_id, is_admin_sale, items }) {
    const chickenInv = _inventory.find(i => i.slug === 'chicken_pieces')
    const totalPieces = items.reduce((a, i) => a + (i.chicken_pieces ?? 0), 0)

    if (chickenInv && totalPieces > 0 && !is_admin_sale) {
      if (totalPieces > chickenInv.quantity) {
        return { error: 'Stock insuficiente. Solo quedan ' + Math.floor(chickenInv.quantity) + ' presas.' }
      }
    }

    const saleId = uuidv4()
    const now = new Date()
    const y   = now.getFullYear()
    const m   = String(now.getMonth() + 1).padStart(2, '0')
    const d   = String(now.getDate()).padStart(2, '0')
    const receiptNumber = 'REC-' + y + m + d + '-' + String(_sales.length + 1).padStart(4, '0')
    const total = items.reduce((a, i) => a + i.subtotal, 0)

    const sale = {
      id: saleId,
      receipt_number: receiptNumber,
      employee_id,
      is_admin_sale: is_admin_sale ?? false,
      total_amount: total,
      created_at: now.toISOString(),
    }

    _sales.push(sale)

    items.forEach(item => {
      _saleItems.push({
        id: uuidv4(),
        sale_id: saleId,
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.subtotal,
        chicken_pieces: item.chicken_pieces ?? 0,
      })
    })

    if (chickenInv && totalPieces > 0) {
      chickenInv.quantity -= totalPieces
      this.addInventoryMovement({
        item_id: chickenInv.id,
        movement_type: is_admin_sale ? 'admin_sale' : 'sale',
        quantity_change: -totalPieces,
        notes: 'Venta: ' + receiptNumber,
        created_by: employee_id,
      })
    }

    persist()
    return { data: { receipt_number: receiptNumber, sale_id: saleId, total } }
  },

  getSales({ from, to, search, filterType, page, pageSize } = {}) {
    const pg = page ?? 0
    const ps = pageSize ?? 20

    let result = _sales.map(s => ({
      ...s,
      employee_name: (() => {
        const p = _profiles.find(p => p.id === s.employee_id)
        return p ? (p.first_name + ' ' + p.last_name) : '-'
      })(),
    }))

    if (from)   result = result.filter(s => new Date(s.created_at) >= new Date(from))
    if (to)     result = result.filter(s => new Date(s.created_at) <= new Date(to))
    if (search) result = result.filter(s => s.receipt_number.toLowerCase().includes(search.toLowerCase()))
    if (filterType === 'normal') result = result.filter(s => !s.is_admin_sale)
    if (filterType === 'admin')  result = result.filter(s =>  s.is_admin_sale)

    result = result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    const total = result.length
    const data  = result.slice(pg * ps, (pg + 1) * ps)
    return { data, total }
  },

  getSalesByEmployee(employee_id, from) {
    let result = _sales.filter(s => s.employee_id === employee_id)
    if (from) result = result.filter(s => new Date(s.created_at) >= new Date(from))
    return result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  },

  getLastSales(limit) {
    const lim = limit ?? 8
    return _sales
      .slice()
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, lim)
      .map(s => ({
        ...s,
        employee_name: (() => {
          const p = _profiles.find(p => p.id === s.employee_id)
          return p ? (p.first_name + ' ' + p.last_name) : '-'
        })(),
      }))
  },

  getSaleById(id) {
    const sale = _sales.find(s => s.id === id)
    if (!sale) return null
    const profile = _profiles.find(p => p.id === sale.employee_id)
    return { ...sale, profiles: profile ?? null }
  },

  getSaleItems(sale_id) {
    return _saleItems
      .filter(i => i.sale_id === sale_id)
      .sort((a, b) => a.product_name.localeCompare(b.product_name))
  },

  // ── Dashboard ─────────────────────────────────────────────
  getDashboardData({ from, to }) {
    const sales = _sales
      .filter(s => {
        const d = new Date(s.created_at)
        return d >= new Date(from) && d <= new Date(to)
      })
      .map(s => ({
        ...s,
        employee_name: (() => {
          const p = _profiles.find(p => p.id === s.employee_id)
          return p ? (p.first_name + ' ' + p.last_name) : '-'
        })(),
      }))

    const today = new Date().toISOString().split('T')[0]
    const todaySales = _sales.filter(s => s.created_at.startsWith(today))
    const byEmployeeMap = {}

    todaySales.forEach(s => {
      if (!byEmployeeMap[s.employee_id]) {
        const p = _profiles.find(p => p.id === s.employee_id)
        byEmployeeMap[s.employee_id] = {
          employee_id: s.employee_id,
          employee_name: p ? (p.first_name + ' ' + p.last_name) : '-',
          total_transactions: 0,
          real_income: 0,
          admin_consumption: 0,
        }
      }
      byEmployeeMap[s.employee_id].total_transactions++
      if (s.is_admin_sale) {
        byEmployeeMap[s.employee_id].admin_consumption += Number(s.total_amount)
      } else {
        byEmployeeMap[s.employee_id].real_income += Number(s.total_amount)
      }
    })

    return {
      sales,
      byEmployee: Object.values(byEmployeeMap),
      inventory: [..._inventory],
    }
  },
}
