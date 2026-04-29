import { useRef } from 'react'
import { Printer, X, AlertTriangle } from 'lucide-react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'

/**
 * ReceiptModal — muestra el recibo después de una venta exitosa.
 * receipt: { receipt_number, total, employee_name, is_admin_sale, items, created_at }
 */
export default function ReceiptModal({ open, receipt, onClose }) {
  const printRef = useRef(null)

  if (!receipt) return null

  const now = new Date()
  const dateStr = now.toLocaleDateString('es-BO', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  })
  const timeStr = now.toLocaleTimeString('es-BO', {
    hour: '2-digit', minute: '2-digit'
  })

  const handlePrint = () => {
    const content = printRef.current?.innerHTML
    if (!content) return

    const win = window.open('', '_blank', 'width=400,height=600')
    win.document.write(`
      <html>
        <head>
          <title>Recibo ${receipt.receipt_number}</title>
          <style>
            body { font-family: monospace; font-size: 12px; margin: 20px; color: #000; }
            .center { text-align: center; }
            .divider { border-top: 1px dashed #000; margin: 8px 0; }
            table { width: 100%; border-collapse: collapse; }
            th, td { text-align: left; padding: 2px 4px; }
            th { border-bottom: 1px dashed #000; }
            .right { text-align: right; }
            .bold { font-weight: bold; }
            .total { font-size: 14px; }
            .admin-note { text-align: center; border: 1px dashed #000; padding: 4px; margin-top: 8px; }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `)
    win.document.close()
    win.print()
    win.close()
  }

  return (
    <Modal open={open} onClose={onClose} size="md" title="Venta Registrada">
      {/* Recibo visual */}
      <div
        ref={printRef}
        className="bg-surface-400 rounded-xl p-5 font-mono text-sm border border-white/8 mb-4"
        id="receipt-content"
      >
        {/* Cabecera */}
        <div className="text-center mb-4">
          <p className="font-bold text-white text-base">BROASTERÍA BRENA</p>
          <div className="border-t border-dashed border-white/20 my-2" />
          <p className="text-white/60 text-xs">Recibo N°: <span className="text-white font-semibold">{receipt.receipt_number}</span></p>
          <p className="text-white/60 text-xs">Fecha: <span className="text-white">{dateStr}  {timeStr}</span></p>
          <p className="text-white/60 text-xs">Atendido por: <span className="text-white">{receipt.employee_name}</span></p>
        </div>

        <div className="border-t border-dashed border-white/20 mb-3" />

        {/* Items */}
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-dashed border-white/20">
              <th className="text-left text-white/50 pb-1.5 font-semibold">PRODUCTO</th>
              <th className="text-center text-white/50 pb-1.5 font-semibold">CANT</th>
              <th className="text-right text-white/50 pb-1.5 font-semibold">P/U</th>
              <th className="text-right text-white/50 pb-1.5 font-semibold">SUBT.</th>
            </tr>
          </thead>
          <tbody>
            {receipt.items?.map((item, idx) => (
              <tr key={idx} className="border-b border-white/5">
                <td className="py-1.5 text-white/80">{item.product_name}</td>
                <td className="py-1.5 text-center text-white/80">{item.quantity}</td>
                <td className="py-1.5 text-right text-white/80">{Number(item.unit_price).toFixed(2)}</td>
                <td className="py-1.5 text-right text-white font-semibold">{Number(item.subtotal).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="border-t border-dashed border-white/20 mt-3 pt-3">
          <div className="flex justify-between items-center">
            <span className="text-white/60 text-sm font-semibold">TOTAL</span>
            <span className="text-xl font-bold text-white">
              Bs {Number(receipt.total_amount || receipt.total || 0).toFixed(2)}
            </span>
          </div>
        </div>

        <div className="border-t border-dashed border-white/20 mt-3 pt-2">
          <p className="text-center text-xs text-white/30">Factura local · Sin impuestos</p>
        </div>

        {/* Leyenda venta admin */}
        {receipt.is_admin_sale && (
          <div className="mt-3 border border-dashed border-brand-500/50 rounded-lg px-3 py-2 bg-brand-500/8 flex items-center justify-center gap-2">
            <AlertTriangle size={14} className="text-brand-400" />
            <p className="text-brand-400 text-xs font-bold text-center">
              CONSUMO INTERNO — SIN CARGO
            </p>
          </div>
        )}
      </div>

      {/* Acciones */}
      <div className="flex gap-3">
        <Button variant="secondary" className="flex-1" onClick={onClose}>
          <X size={16} />
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
