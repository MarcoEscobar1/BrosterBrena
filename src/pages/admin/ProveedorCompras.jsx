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
    <div className="p-4 sm:p-6 flex flex-col gap-6 animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/proveedores')}
            className="p-2 -ml-2 rounded-xl hover:bg-white/8 text-white/50 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="w-10 h-10 rounded-xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center shrink-0">
            <ShoppingBag size={20} className="text-brand-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">
              {supplier?.first_name} {supplier?.last_name}
            </h1>
            <p className="text-xs text-white/40">Historial de compras · Tel: {supplier?.phone}</p>
          </div>
        </div>
        <Button variant="secondary" size="sm" onClick={exportPDF} disabled={orders.length === 0} className="w-full sm:w-auto">
          <FileDown size={16} />
          Exportar PDF
        </Button>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {[
          { label: 'Total Compras',   value: orders.length,             icon: Hash      },
          { label: 'Pollos Totales',  value: totalChickens,             icon: ShoppingBag },
          { label: 'Presas Totales',  value: totalPieces.toLocaleString(), icon: Calendar },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="card text-center py-4">
            <Icon size={20} className="text-brand-500 mx-auto mb-1.5" />
            <p className="text-2xl sm:text-3xl font-black text-white">{value}</p>
            <p className="text-xs text-white/40 mt-0.5 uppercase tracking-wider font-semibold">{label}</p>
          </div>
        ))}
      </div>

      {/* Historial */}
      <div className="card p-0 overflow-hidden">
        {orders.length === 0 ? (
          <div className="text-center py-16 text-white/30">
            <ShoppingBag size={40} strokeWidth={1} className="mx-auto mb-3" />
            <p>Este proveedor no tiene compras registradas</p>
          </div>
        ) : (
          <>
            {/* Móvil: Cards */}
            <div className="block md:hidden divide-y divide-white/5">
              {orders.map(o => {
                const item     = o.purchase_order_items?.[0]
                const pieces   = item?.quantity ?? 0
                const chickens = Math.floor(pieces / 10)
                return (
                  <div key={o.id} className="p-4 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-white/50">
                        <Calendar size={13} />
                        {new Date(o.created_at).toLocaleDateString('es-BO', {
                          day: '2-digit', month: '2-digit', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-white text-sm">{chickens} pollos</span>
                        <span className="text-xs text-brand-400 font-semibold ml-1.5">({pieces} presas)</span>
                      </div>
                    </div>
                    {o.notes && (
                      <p className="text-xs text-white/50 bg-white/5 px-2.5 py-1 rounded-lg">
                        {o.notes}
                      </p>
                    )}
                    <div className="text-[11px] text-white/40 pt-1">
                      Registrado por: {o.profiles ? `${o.profiles.first_name} ${o.profiles.last_name}` : '-'}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Tablet/Desktop: Tabla */}
            <div className="hidden md:block overflow-x-auto">
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
            </div>
          </>
        )}
      </div>
    </div>
  )
}
