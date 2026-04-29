import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import { ArrowLeft, Printer, AlertTriangle } from 'lucide-react'

export default function VentaDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { profile } = useAuth()
  const [sale,    setSale]    = useState(null)
  const [items,   setItems]   = useState([])
  const [loading, setLoading] = useState(true)

  const handleBack = () => navigate(profile?.role === 'admin' ? '/admin/ventas' : '/empleado/ventas')

  useEffect(() => {
    const fetchSale = async () => {
      setLoading(true)
      const [{ data: saleData }, { data: itemsData }] = await Promise.all([
        supabase
          .from('sales')
          .select(`*, profiles(first_name, last_name, username)`)
          .eq('id', id)
          .single(),
        supabase
          .from('sale_items')
          .select('*')
          .eq('sale_id', id)
          .order('product_name'),
      ])
      setSale(saleData)
      setItems(itemsData ?? [])
      setLoading(false)
    }
    fetchSale()
  }, [id])

  const handlePrint = () => window.print()

  if (loading) {
    return <div className="flex justify-center items-center h-full py-24"><Spinner size="lg" /></div>
  }
  if (!sale) {
    return (
      <div className="p-6 text-center text-white/40">
        <p>Venta no encontrada</p>
        <Button variant="secondary" className="mt-4" onClick={handleBack}>
          Volver
        </Button>
      </div>
    )
  }

  const dateStr = new Date(sale.created_at).toLocaleDateString('es-BO', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  })

  return (
    <div className="p-6 max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={handleBack}
          className="p-2 rounded-xl hover:bg-white/8 text-white/40 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-white font-mono">{sale.receipt_number}</h1>
            {sale.is_admin_sale && (
              <Badge variant="orange"><AlertTriangle size={11} />Consumo Interno</Badge>
            )}
          </div>
          <p className="text-xs text-white/40 mt-0.5">{dateStr}</p>
        </div>
        <Button variant="secondary" size="sm" onClick={handlePrint}>
          <Printer size={15} />
          Imprimir
        </Button>
      </div>

      {/* Recibo */}
      <div className="card bg-surface-400 font-mono">
        {/* Cabecera */}
        <div className="text-center border-b border-dashed border-white/15 pb-4 mb-4">
          <p className="text-lg font-bold text-white">BROASTERÍA BRENA</p>
          <p className="text-xs text-white/40 mt-1">Recibo N°: <span className="text-white font-semibold">{sale.receipt_number}</span></p>
          <p className="text-xs text-white/40">Fecha: <span className="text-white">{dateStr}</span></p>
          <p className="text-xs text-white/40">
            Atendido por: <span className="text-white">
              {sale.profiles?.first_name} {sale.profiles?.last_name}
            </span>
          </p>
        </div>

        {/* Items */}
        <table className="w-full text-xs mb-4">
          <thead>
            <tr className="border-b border-dashed border-white/15">
              <th className="text-left pb-2 text-white/50 font-semibold">PRODUCTO</th>
              <th className="text-center pb-2 text-white/50 font-semibold">CANT</th>
              <th className="text-right pb-2 text-white/50 font-semibold">P/U</th>
              <th className="text-right pb-2 text-white/50 font-semibold">SUBTOTAL</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} className="border-b border-white/5">
                <td className="py-2 text-white/80">{item.product_name}</td>
                <td className="py-2 text-center text-white/80">{item.quantity}</td>
                <td className="py-2 text-right text-white/80">{Number(item.unit_price).toFixed(2)}</td>
                <td className="py-2 text-right text-white font-semibold">{Number(item.subtotal).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Total */}
        <div className="border-t border-dashed border-white/15 pt-3 flex justify-between items-center">
          <span className="text-white/60 font-semibold">TOTAL</span>
          <span className="text-2xl font-bold text-white">
            Bs {Number(sale.total_amount).toFixed(2)}
          </span>
        </div>

        <div className="border-t border-dashed border-white/15 mt-3 pt-2 text-center">
          <p className="text-xs text-white/30">Factura local · Sin impuestos</p>
        </div>

        {sale.is_admin_sale && (
          <div className="mt-4 border border-dashed border-brand-500/50 rounded-lg px-3 py-2 bg-brand-500/8 flex items-center justify-center gap-2">
            <AlertTriangle size={14} className="text-brand-400" />
            <p className="text-brand-400 text-xs font-bold">CONSUMO INTERNO — SIN CARGO</p>
          </div>
        )}
      </div>
    </div>
  )
}
