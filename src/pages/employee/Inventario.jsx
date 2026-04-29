import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import Spinner from '../../components/ui/Spinner'
import Badge from '../../components/ui/Badge'
import { Warehouse, AlertTriangle, CheckCircle } from 'lucide-react'

export default function InventarioEmpleado() {
  const [items,   setItems]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('inventory_items').select('*').order('name')
      .then(({ data }) => {
        setItems(data ?? [])
        setLoading(false)
      })
  }, [])

  return (
    <div className="p-6 flex flex-col gap-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center">
          <Warehouse size={20} className="text-brand-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Inventario</h1>
          <p className="text-xs text-white/40">Stock actual — Solo lectura</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map(item => {
            const ok      = item.quantity > item.min_stock
            const low     = item.quantity <= item.min_stock && item.quantity > 0
            const empty   = item.quantity === 0

            return (
              <div
                key={item.id}
                className={`card border ${
                  empty ? 'border-red-500/30 bg-red-500/5' :
                  low   ? 'border-yellow-500/30 bg-yellow-500/5' :
                  'border-emerald-500/20'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <p className="font-semibold text-white">{item.name}</p>
                  <Badge variant={empty ? 'red' : low ? 'yellow' : 'green'}>
                    {empty ? <><AlertTriangle size={10} />Sin Stock</> :
                     low   ? <><AlertTriangle size={10} />Bajo</> :
                     <><CheckCircle size={10} />OK</>}
                  </Badge>
                </div>
                <p className={`text-4xl font-bold ${empty ? 'text-red-400' : low ? 'text-yellow-400' : 'text-emerald-400'}`}>
                  {Math.floor(item.quantity)}
                </p>
                <p className="text-xs text-white/30 mt-1">
                  {item.unit}s · Mínimo: {item.min_stock}
                </p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
