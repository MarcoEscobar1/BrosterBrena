import { useRef } from 'react'
import { Printer, AlertTriangle, X } from 'lucide-react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { printReceipt } from '../../lib/printReceipt'

/**
 * ReceiptModal — muestra el recibo después de una venta exitosa.
 * receipt: { receipt_number, total, employee_name, is_admin_sale, items, created_at }
 */
export default function ReceiptModal({ open, receipt, onClose }) {
  const printRef = useRef(null)

  if (!receipt) return null

  const now = new Date(receipt.created_at)
  const dateStr = now.toLocaleDateString('es-BO', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  })
  const timeStr = now.toLocaleTimeString('es-BO', {
    hour: '2-digit', minute: '2-digit'
  })

  const handlePrint = () => printReceipt(printRef.current)

  return (
    <Modal open={open} onClose={onClose} size="md" title="Venta Registrada">
      {/* Recibo visual */}
      <div
        ref={printRef}
        className="bg-surface-400 rounded-xl p-4 sm:p-5 font-mono text-xs sm:text-sm border border-line mb-4 max-h-[58vh] overflow-y-auto"
        id="receipt-content"
      >
        {/* Cabecera */}
        <div className="text-center mb-4">
          <p className="font-bold text-ink text-base">BROASTERÍA BRENA</p>
          <div className="border-t border-dashed border-line my-2" />
          <p className="text-muted text-xs">Recibo N°: <span className="text-ink font-semibold">{receipt.receipt_number}</span></p>
          <p className="text-muted text-xs">Fecha: <span className="text-ink">{dateStr}  {timeStr}</span></p>
          <p className="text-muted text-xs">Atendido por: <span className="text-ink">{receipt.employee_name}</span></p>
        </div>

        <div className="border-t border-dashed border-line mb-3" />

        {/* Items */}
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-dashed border-line">
              <th className="text-left text-muted pb-1.5 font-semibold">PRODUCTO</th>
              <th className="text-center text-muted pb-1.5 font-semibold">CANT</th>
              <th className="text-right text-muted pb-1.5 font-semibold">P/U</th>
              <th className="text-right text-muted pb-1.5 font-semibold">SUBT.</th>
            </tr>
          </thead>
          <tbody>
            {receipt.items?.map((item, idx) => (
              <tr key={idx} className="border-b border-line">
                <td className="py-1.5 text-ink">{item.product_name}</td>
                <td className="py-1.5 text-center text-ink">{item.quantity}</td>
                <td className="py-1.5 text-right text-ink">{Number(item.unit_price).toFixed(2)}</td>
                <td className="py-1.5 text-right text-ink font-semibold">{Number(item.subtotal).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="border-t border-dashed border-line mt-3 pt-3">
          <div className="flex justify-between items-center">
            <span className="text-muted text-sm font-semibold">TOTAL</span>
            <span className="text-xl font-bold text-ink">
              Bs {Number(receipt.total_amount || receipt.total || 0).toFixed(2)}
            </span>
          </div>
        </div>

        <div className="border-t border-dashed border-line mt-3 pt-2">
          <p className="text-center text-xs text-muted">Factura local · Sin impuestos</p>
        </div>

        {/* Leyenda venta admin */}
        {receipt.is_admin_sale && (
          <div className="mt-3 border border-dashed border-brand-500/50 rounded-lg px-3 py-2 bg-brand-500/8 flex items-center justify-center gap-2">
            <AlertTriangle aria-hidden="true" size={14} className="text-brand-700" />
            <p className="text-brand-700 text-xs font-bold text-center">
              CONSUMO INTERNO — SIN CARGO
            </p>
          </div>
        )}
      </div>

      {/* Acciones */}
      <div className="flex gap-3">
        <Button variant="secondary" className="flex-1" onClick={onClose}>
          <X aria-hidden="true" size={16} />
          Cerrar
        </Button>
        <Button variant="primary" className="flex-1" onClick={handlePrint}>
          <Printer size={16} />
          Imprimir
        </Button>
      </div>
    </Modal>
  )
}
