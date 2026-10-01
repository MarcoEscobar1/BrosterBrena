import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { db } from '../../lib/mockDb'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'
import toast from 'react-hot-toast'
import { ArrowLeft, FileDown, ShoppingBag, Calendar, Hash, StickyNote } from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export default function ProveedorCompras() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [supplier, setSupplier] = useState(null)
  const [orders,   setOrders]   = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    const sup  = db.getSupplierById(id)
    const ords = db.getPurchaseOrdersBySupplier(id)
    setSupplier(sup)
    setOrders(ords)
    setLoading(false)
  }, [id])

  const exportPDF = () => {
    if (!supplier || orders.length === 0) return
    const doc = new jsPDF()
    const now = new Date()

    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('BROASTERIA BRENA', 105, 18, { align: 'center' })
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text('Historial de Compras — ' + supplier.first_name + ' ' + supplier.last_name, 105, 26, { align: 'center' })
    doc.setFontSize(9)
    doc.text('Tel: ' + supplier.phone, 105, 32, { align: 'center' })
    doc.text('Generado: ' + now.toLocaleDateString('es-BO') + ' ' + now.toLocaleTimeString('es-BO'), 105, 38, { align: 'center' })

    const rows = orders.map(o => {
      const item    = o.purchase_order_items?.[0]
      const pieces  = item?.quantity ?? 0
      const chickens = Math.floor(pieces / 10)
      return [
        new Date(o.created_at).toLocaleDateString('es-BO'),
        chickens,
        pieces,
        o.profiles ? (o.profiles.first_name + ' ' + o.profiles.last_name).trim() : '',
        o.notes ?? '',
      ]
    })

    autoTable(doc, {
      startY: 44,
      head: [['Fecha', 'Pollos', 'Presas', 'Registrado por', 'Notas']],
      body: rows,
      styles:     { fontSize: 9 },
      headStyles: { fillColor: [249, 115, 22] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    })

    doc.save('compras-' + supplier.first_name + '-' + supplier.last_name + '.pdf')
    toast.success('PDF generado correctamente')
  }

  if (loading) {
    return <div className="flex justify-center items-center h-full py-24"><Spinner size="lg" /></div>
  }

  const totalPieces   = orders.reduce((a, o) => a + (o.purchase_order_items?.[0]?.quantity ?? 0), 0)
  const totalChickens = Math.floor(totalPieces / 10)

  return (
    <div className="p-6 flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/proveedores')}
          className="p-2 rounded-xl hover:bg-white/8 text-white/40 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center">
            <ShoppingBag size={20} className="text-brand-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">
              {supplier?.first_name} {supplier?.last_name}
            </h1>
            <p className="text-xs text-white/40">Historial de compras · Tel: {supplier?.phone}</p>
          </div>
        </div>
        <Button variant="secondary" className="ml-auto" onClick={exportPDF} disabled={orders.length === 0}>
          <FileDown size={16} />
          Exportar PDF
        </Button>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Compras',   value: orders.length,             icon: Hash      },
          { label: 'Pollos Totales',  value: totalChickens,             icon: ShoppingBag },
          { label: 'Presas Totales',  value: totalPieces.toLocaleString(), icon: Calendar },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="card text-center">
            <Icon size={20} className="text-brand-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-xs text-white/40 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Tabla de compras */}
      <div className="card p-0 overflow-hidden">
        {orders.length === 0 ? (
          <div className="text-center py-16 text-white/30">
            <ShoppingBag size={40} strokeWidth={1} className="mx-auto mb-3" />
            <p>Este proveedor no tiene compras registradas</p>
          </div>
        ) : (
          <table className="table-base">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Pollos</th>
                <th>Presas</th>
                <th>Registrado por</th>
                <th>Notas</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => {
                const item     = o.purchase_order_items?.[0]
                const pieces   = item?.quantity ?? 0
                const chickens = Math.floor(pieces / 10)
                return (
                  <tr key={o.id}>
                    <td className="text-white/80">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-white/30" />
                        {new Date(o.created_at).toLocaleDateString('es-BO', {
                          day: '2-digit', month: '2-digit', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </div>
                    </td>
                    <td>
                      <span className="font-semibold text-white">{chickens}</span>
                      <span className="text-white/40 text-xs ml-1">pollos</span>
                    </td>
                    <td>
                      <span className="font-semibold text-brand-400">{pieces}</span>
                      <span className="text-white/40 text-xs ml-1">presas</span>
                    </td>
                    <td className="text-white/60 text-sm">
                      {o.profiles ? `${o.profiles.first_name} ${o.profiles.last_name}` : '-'}
                    </td>
                    <td className="text-white/40 text-xs">
                      <div className="flex items-center gap-1">
                        {o.notes ? <><StickyNote size={11} />{o.notes}</> : '-'}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
