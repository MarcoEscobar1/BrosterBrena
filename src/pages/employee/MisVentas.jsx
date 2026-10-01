import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../../lib/mockDb'
import { useAuth } from '../../context/AuthContext'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import { Receipt, Eye, AlertTriangle } from 'lucide-react'

export default function MisVentas() {
  const { profile } = useAuth()
  const navigate    = useNavigate()
  const [sales,   setSales]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) return
    const today = new Date().toISOString().split('T')[0]
    const result = db.getSalesByEmployee(profile.id, today + 'T00:00:00')
    setSales(result)
    setLoading(false)
  }, [profile])

  const total = sales.filter(s => !s.is_admin_sale).reduce((a, s) => a + Number(s.total_amount), 0)

  return (
    <div className="p-6 flex flex-col gap-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center">
          <Receipt size={20} className="text-brand-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Mis Ventas del Dia</h1>
          <p className="text-xs text-white/40">Solo tus ventas de hoy</p>
        </div>
        <div className="ml-auto card py-2 px-4">
          <p className="text-xs text-white/40">Total del dia</p>
          <p className="text-lg font-bold text-emerald-400">Bs {total.toFixed(2)}</p>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : sales.length === 0 ? (
          <div className="text-center py-16 text-white/30">
            <Receipt size={40} strokeWidth={1} className="mx-auto mb-3" />
            <p>Aun no tienes ventas hoy</p>
          </div>
        ) : (
          <table className="table-base">
            <thead>
              <tr>
                <th>N° Recibo</th>
                <th>Hora</th>
                <th>Total</th>
                <th>Tipo</th>
                <th className="!text-center">Accion</th>
              </tr>
            </thead>
            <tbody>
              {sales.map(sale => (
                <tr key={sale.id} className={sale.is_admin_sale ? 'admin-sale-row' : ''}>
                  <td className="font-mono text-xs font-semibold text-white/80">{sale.receipt_number}</td>
                  <td className="text-white/60 text-xs">
                    {new Date(sale.created_at).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td>
                    <span className={`font-bold ${sale.is_admin_sale ? 'text-brand-400' : 'text-white'}`}>
                      Bs {Number(sale.total_amount).toFixed(2)}
                    </span>
                  </td>
                  <td>
                    {sale.is_admin_sale
                      ? <Badge variant="orange"><AlertTriangle size={10} />Interno</Badge>
                      : <Badge variant="green">Normal</Badge>
                    }
                  </td>
                  <td>
                    <div className="flex justify-center">
                      <button
                        onClick={() => navigate(`/empleado/ventas/${sale.id}`)}
                        className="p-1.5 rounded-lg hover:bg-white/8 text-white/40 hover:text-white transition-colors"
                      >
                        <Eye size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
