import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { db } from '../../lib/mockDb'
import { useAuth } from '../../context/AuthContext'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Spinner from '../../components/ui/Spinner'
import Badge from '../../components/ui/Badge'
import toast from 'react-hot-toast'
import {
  Warehouse, TrendingUp, TrendingDown, ShoppingBag,
  AlertTriangle, CheckCircle, Clock, RefreshCw, Plus, Droplets, Drumstick
} from 'lucide-react'

const purchaseSchema = z.object({
  supplier_id: z.string().min(1, 'Selecciona un proveedor'),
  chickens:    z.coerce.number().int().min(1, 'Debe ser al menos 1 pollo'),
  notes:       z.string().optional(),
})

const drinkAdjustSchema = z.object({
  item_id:  z.string().min(1, 'Selecciona un articulo'),
  quantity: z.coerce.number().int().min(1, 'Debe ser al menos 1 unidad'),
  notes:    z.string().optional(),
})

function getStockStatus(quantity, minStock) {
  if (quantity === 0)       return { label: 'Sin Stock',  variant: 'red',    icon: AlertTriangle }
  if (quantity <= minStock) return { label: 'Stock Bajo', variant: 'yellow', icon: AlertTriangle }
  return                           { label: 'Normal',     variant: 'green',  icon: CheckCircle  }
}

const MOVEMENT_LABELS = {
  purchase:   { label: 'Compra',          variant: 'green',  icon: TrendingUp  },
  sale:       { label: 'Venta',           variant: 'red',    icon: TrendingDown },
  admin_sale: { label: 'Consumo Interno', variant: 'orange', icon: ShoppingBag  },
}

export default function Inventario() {
  const { profile } = useAuth()
  const [items,      setItems]      = useState([])
  const [movements,  setMovements]  = useState([])
  const [suppliers,  setSuppliers]  = useState([])
  const [loading,    setLoading]    = useState(true)
  const [loadingMov, setLoadingMov] = useState(true)
  const [modalOpen,  setModalOpen]  = useState(false)
  const [drinkModal, setDrinkModal] = useState(false)
  const [saving,     setSaving]     = useState(false)

  const chickenForm = useForm({ resolver: zodResolver(purchaseSchema) })
  const watchChickens = chickenForm.watch('chickens', 0)
  const drinkForm = useForm({ resolver: zodResolver(drinkAdjustSchema) })

  const chickenItems = items.filter(i => i.slug === 'chicken_pieces')
  const drinkItems   = items.filter(i => i.slug !== 'chicken_pieces')

  const fetchAll = () => {
    setLoading(true)
    setItems(db.getInventory())
    setSuppliers(db.getActiveSuppliers())
    setLoading(false)
  }

  const fetchMovements = () => {
    setLoadingMov(true)
    setMovements(db.getMovements(50))
    setLoadingMov(false)
  }

  useEffect(() => { fetchAll(); fetchMovements() }, [])

  // Compra de pollos
  const onChickenSubmit = async ({ supplier_id, chickens, notes }) => {
    setSaving(true)
    try {
      const result = db.registerPurchase({
        supplier_id,
        chickens: Number(chickens),
        notes:    notes || null,
        created_by: profile.id,
      })
      if (result.error) throw new Error(result.error)
      toast.success(`Compra registrada: +${result.data.pieces_added} presas (${result.data.chickens_added} pollos)`)
      setModalOpen(false)
      chickenForm.reset()
      fetchAll()
      fetchMovements()
    } catch (err) {
      toast.error(err.message || 'Error al registrar compra')
    } finally {
      setSaving(false)
    }
  }

  // Ajuste de stock de refrescos
  const onDrinkSubmit = async ({ item_id, quantity, notes }) => {
    setSaving(true)
    try {
      const item = drinkItems.find(i => i.id === item_id)
      if (!item) throw new Error('Articulo no encontrado')

      const newQty = item.quantity + Number(quantity)
      const updateResult = db.updateInventoryItem(item_id, { quantity: newQty })
      if (updateResult.error) throw new Error(updateResult.error)

      db.addInventoryMovement({
        item_id,
        movement_type:   'purchase',
        quantity_change: Number(quantity),
        notes: notes || `Recarga manual: +${quantity} ${item.unit}(s)`,
        created_by: profile.id,
      })

      toast.success(`+${quantity} ${item.unit}(s) agregados a ${item.name}`)
      setDrinkModal(false)
      drinkForm.reset()
      fetchAll()
      fetchMovements()
    } catch (err) {
      toast.error(err.message || 'Error al ajustar stock')
    } finally {
      setSaving(false)
    }
  }

  const openDrinkModal = () => {
    drinkForm.reset({ quantity: 1 })
    setDrinkModal(true)
  }

  return (
    <div className="p-6 flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center">
            <Warehouse size={20} className="text-brand-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Inventario</h1>
            <p className="text-xs text-white/40">Control de stock y movimientos</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => { fetchAll(); fetchMovements() }}>
            <RefreshCw size={15} />
            Actualizar
          </Button>
          <Button variant="secondary" onClick={openDrinkModal}>
            <Droplets size={16} />
            Recargar Refrescos
          </Button>
          <Button variant="primary" onClick={() => { chickenForm.reset({ chickens: 1 }); setModalOpen(true) }}>
            <Plus size={16} />
            Compra de Pollos
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Seccion Pollos */}
          {chickenItems.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Drumstick size={16} className="text-brand-400" />
                <p className="text-sm font-semibold text-white/70 uppercase tracking-wide">Pollo</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {chickenItems.map(item => <StockCard key={item.id} item={item} />)}
              </div>
            </div>
          )}

          {/* Seccion Refrescos */}
          {drinkItems.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Droplets size={16} className="text-blue-400" />
                <p className="text-sm font-semibold text-white/70 uppercase tracking-wide">Refrescos</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {drinkItems.map(item => <StockCard key={item.id} item={item} />)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Historial de movimientos */}
      <div className="card p-0 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
          <h2 className="font-semibold text-white">Historial de Movimientos</h2>
          <span className="text-xs text-white/40">Ultimos 50</span>
        </div>
        {loadingMov ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : movements.length === 0 ? (
          <div className="text-center py-12 text-white/30">
            <Clock size={32} strokeWidth={1} className="mx-auto mb-2" />
            <p className="text-sm">Sin movimientos registrados</p>
          </div>
        ) : (
          <table className="table-base">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Articulo</th>
                <th>Cambio</th>
                <th>Notas</th>
                <th>Realizado por</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {movements.map(mov => {
                const meta = MOVEMENT_LABELS[mov.movement_type] ?? MOVEMENT_LABELS.sale
                const MovIcon = meta.icon
                return (
                  <tr key={mov.id}>
                    <td>
                      <Badge variant={meta.variant}>
                        <MovIcon size={11} />
                        {meta.label}
                      </Badge>
                    </td>
                    <td className="text-white/80">{mov.inventory_items?.name}</td>
                    <td>
                      <span className={`font-bold ${mov.quantity_change > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {mov.quantity_change > 0 ? '+' : ''}{mov.quantity_change}
                      </span>
                    </td>
                    <td className="text-white/50 text-xs max-w-xs truncate">{mov.notes ?? '-'}</td>
                    <td className="text-white/60 text-xs">
                      {mov.profiles ? `${mov.profiles.first_name} ${mov.profiles.last_name}` : '-'}
                    </td>
                    <td className="text-white/40 text-xs">
                      {new Date(mov.created_at).toLocaleDateString('es-BO', {
                        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal: Compra de Pollos */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Registrar Compra de Pollos" size="md">
        <form onSubmit={chickenForm.handleSubmit(onChickenSubmit)} className="flex flex-col gap-4">
          <Select id="inv-supplier" label="Proveedor" error={chickenForm.formState.errors.supplier_id?.message} {...chickenForm.register('supplier_id')}>
            <option value="">- Selecciona un proveedor -</option>
            {suppliers.map(s => (
              <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>
            ))}
          </Select>

          <Input
            id="inv-chickens"
            label="Cantidad de pollos enteros"
            type="number" min="1"
            placeholder="Ej: 5"
            error={chickenForm.formState.errors.chickens?.message}
            helper={watchChickens > 0 ? `= ${watchChickens * 10} presas de pollo` : '1 pollo = 10 presas'}
            {...chickenForm.register('chickens')}
          />

          <div>
            <label className="text-xs font-medium text-white/60 uppercase tracking-wide block mb-1.5">Notas (opcional)</label>
            <textarea rows={2} placeholder="Observaciones..." className="input-base resize-none" {...chickenForm.register('notes')} />
          </div>

          {watchChickens > 0 && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 flex items-center gap-3">
              <TrendingUp size={18} className="text-emerald-400 shrink-0" />
              <div>
                <p className="text-sm text-emerald-400 font-semibold">+{watchChickens * 10} presas se agregaran al inventario</p>
                <p className="text-xs text-white/40">{watchChickens} pollos x 10 presas/pollo</p>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" variant="primary" className="flex-1" loading={saving}>Registrar Compra</Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Recarga de Refrescos */}
      <Modal open={drinkModal} onClose={() => setDrinkModal(false)} title="Recargar Stock de Refrescos" size="md">
        <form onSubmit={drinkForm.handleSubmit(onDrinkSubmit)} className="flex flex-col gap-4">
          <Select
            id="drink-item"
            label="Refresco"
            error={drinkForm.formState.errors.item_id?.message}
            {...drinkForm.register('item_id')}
          >
            <option value="">- Selecciona un refresco -</option>
            {drinkItems.map(item => (
              <option key={item.id} value={item.id}>
                {item.name} (stock actual: {Math.floor(item.quantity)})
              </option>
            ))}
          </Select>

          <Input
            id="drink-qty"
            label="Cantidad a agregar"
            type="number" min="1"
            placeholder="Ej: 12"
            error={drinkForm.formState.errors.quantity?.message}
            {...drinkForm.register('quantity')}
          />

          <div>
            <label className="text-xs font-medium text-white/60 uppercase tracking-wide block mb-1.5">Notas (opcional)</label>
            <textarea rows={2} placeholder="Ej: Caja de 12 unidades..." className="input-base resize-none" {...drinkForm.register('notes')} />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setDrinkModal(false)}>Cancelar</Button>
            <Button type="submit" variant="primary" className="flex-1" loading={saving}>Agregar Stock</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

function StockCard({ item }) {
  const status = getStockStatus(item.quantity, item.min_stock)
  const StatusIcon = status.icon
  return (
    <div className={`card border ${
      status.variant === 'red'    ? 'border-red-500/30 bg-red-500/5' :
      status.variant === 'yellow' ? 'border-yellow-500/30 bg-yellow-500/5' :
      'border-emerald-500/20'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs text-white/40 uppercase tracking-wide font-medium">{item.unit}</p>
          <p className="text-base font-semibold text-white mt-0.5">{item.name}</p>
        </div>
        <Badge variant={status.variant}>
          <StatusIcon size={11} />
          {status.label}
        </Badge>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className={`text-4xl font-bold ${
            status.variant === 'red' ? 'text-red-400' :
            status.variant === 'yellow' ? 'text-yellow-400' : 'text-emerald-400'
          }`}>
            {Math.floor(item.quantity)}
          </p>
          <p className="text-xs text-white/30 mt-0.5">Minimo: {item.min_stock} {item.unit}s</p>
        </div>
        {status.variant !== 'green' && (
          <AlertTriangle size={20} className={
            status.variant === 'red' ? 'text-red-400' : 'text-yellow-400'
          } />
        )}
      </div>
    </div>
  )
}
