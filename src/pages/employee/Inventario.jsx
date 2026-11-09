import { db } from '../../lib/mockDb'
import Spinner from '../../components/ui/Spinner'
import Badge from '../../components/ui/Badge'
import { Warehouse, AlertTriangle, CheckCircle } from 'lucide-react'

export default function InventarioEmpleado() {
  const items = db.getInventory()
  const loading = false

  return (
    <div className="p-4 sm:p-6 flex flex-col gap-6  max-w-7xl mx-auto">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink">Inventario</h1>
          <p className="text-xs text-muted">Stock actual — Solo lectura</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {items.map(item => {
            const low   = item.quantity <= item.min_stock && item.quantity > 0
            const empty = item.quantity === 0

            return (
              <div
                key={item.id}
                className={`card border ${
                  empty ? 'border-red-500/30 bg-danger-soft0/5' :
                  low   ? 'border-yellow-500/30 bg-yellow-500/5' :
                  'border-emerald-500/20'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <p className="font-semibold text-ink text-base">{item.name}</p>
                  <Badge variant={empty ? 'red' : low ? 'yellow' : 'green'}>
                    {empty ? <><AlertTriangle aria-hidden="true" size={10} />Sin Stock</> :
                     low   ? <><AlertTriangle aria-hidden="true" size={10} />Bajo</> :
                     <><CheckCircle size={10} />OK</>}
                  </Badge>
                </div>
                <p className={`text-3xl sm:text-4xl font-bold ${empty ? 'text-danger' : low ? 'text-warning' : 'text-success'}`}>
                  {Math.floor(item.quantity)}
                </p>
                <p className="text-xs text-muted mt-1">
                  {item.unit}s · Minimo: {item.min_stock}
                </p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
