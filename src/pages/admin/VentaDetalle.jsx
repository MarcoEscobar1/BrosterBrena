import { useParams, useNavigate } from 'react-router-dom'
import { useRef } from 'react'
import { printReceipt } from '../../lib/printReceipt'
import { db } from '../../lib/mockDb'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import { ArrowLeft, Printer, AlertTriangle } from 'lucide-react'

export default function VentaDetalle() {
  const receiptRef = useRef(null)
  const { id } = useParams()
  const navigate = useNavigate()
  const { profile } = useAuth()
  const sale = db.getSaleById(id)
  const items = db.getSaleItems(id)
  const loading = false
  const handleBack = () => navigate(profile?.role === 'admin' ? '/admin/ventas' : '/empleado/ventas')

  const handlePrint = () => printReceipt(receiptRef.current)

  if (loading) {
    return <div className="flex justify-center items-center h-full py-24"><Spinner size="lg" /></div>
  }
  if (!sale || (profile?.role !== 'admin' && sale.employee_id !== profile?.id)) {
    return (
      <div className="p-4 sm:p-6 text-center text-muted">
        <p>Venta no encontrada</p>
        <Button variant="secondary" className="mt-4" onClick={handleBack}>Volver</Button>
      </div>
    )
  }

  const dateStr = new Date(sale.created_at).toLocaleDateString('es-BO', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  })

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto ">
      {/* Header */}
      <div className="flex items-center gap-3 sm:gap-4 mb-6">
        <button aria-label="Volver a ventas" onClick={handleBack}
          className="p-2 -ml-2 rounded-xl hover:bg-ink/5 text-muted hover:text-ink transition-colors">
          <ArrowLeft aria-hidden="true" size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <h1 className="text-lg sm:text-xl font-bold text-ink font-mono truncate">{sale.receipt_number}</h1>
            {sale.is_admin_sale && (
              <Badge variant="orange"><AlertTriangle aria-hidden="true" size={11} />Consumo Interno</Badge>
            )}
          </div>
          <p className="text-xs text-muted mt-0.5">{dateStr}</p>
        </div>
        <Button variant="secondary" size="sm" onClick={handlePrint} aria-label="Imprimir recibo" className="shrink-0">
          <Printer size={15} />
          <span className="hidden xs:inline">Imprimir</span>
        </Button>
      </div>

      {/* Recibo */}
      <div ref={receiptRef} className="card bg-surface-400 font-mono p-4 sm:p-6">
        {/* Cabecera */}
        <div className="text-center border-b border-dashed border-line pb-4 mb-4">
          <p className="text-lg font-bold text-ink tracking-normal">BROASTERIA BRENA</p>
          <p className="text-xs text-muted mt-1">Recibo N°: <span className="text-ink font-semibold">{sale.receipt_number}</span></p>
          <p className="text-xs text-muted">Fecha: <span className="text-ink">{dateStr}</span></p>
          <p className="text-xs text-muted">
            Atendido por: <span className="text-ink">
              {sale.profiles ? `${sale.profiles.first_name} ${sale.profiles.last_name}` : '-'}
            </span>
          </p>
        </div>

        {/* Items */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs mb-4">
            <thead>
              <tr className="border-b border-dashed border-line">
                <th className="text-left pb-2 text-muted font-semibold">PRODUCTO</th>
                <th className="text-center pb-2 text-muted font-semibold">CANT</th>
                <th className="text-right pb-2 text-muted font-semibold">P/U</th>
                <th className="text-right pb-2 text-muted font-semibold">SUBTOTAL</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} className="border-b border-line">
                  <td className="py-2 text-ink pr-2">{item.product_name}</td>
                  <td className="py-2 text-center text-ink px-1">{item.quantity}</td>
                  <td className="py-2 text-right text-ink px-1">{Number(item.unit_price).toFixed(2)}</td>
                  <td className="py-2 text-right text-ink font-semibold pl-2">{Number(item.subtotal).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total */}
        <div className="border-t border-dashed border-line pt-3 flex justify-between items-center">
          <span className="text-muted font-semibold text-sm">TOTAL</span>
          <span className="text-2xl sm:text-3xl font-bold text-ink">
            Bs {Number(sale.total_amount).toFixed(2)}
          </span>
        </div>

        <div className="border-t border-dashed border-line mt-3 pt-2 text-center">
          <p className="text-xs text-muted">Factura local · Sin impuestos</p>
        </div>

        {sale.is_admin_sale && (
          <div className="mt-4 border border-dashed border-brand-500/50 rounded-lg px-3 py-2 bg-brand-500/8 flex items-center justify-center gap-2 text-center">
            <AlertTriangle aria-hidden="true" size={14} className="text-brand-700 shrink-0" />
            <p className="text-brand-700 text-xs font-bold">CONSUMO INTERNO - SIN CARGO</p>
          </div>
        )}
      </div>
    </div>
  )
}
