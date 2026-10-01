import { useState } from 'react'
import { db } from '../../lib/mockDb'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import toast from 'react-hot-toast'
import { BarChart3, FileDown, AlertTriangle } from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const REPORT_TYPES = [
  { key: 'daily',   label: 'Ventas Diarias',   desc: 'Todas las ventas de un dia' },
  { key: 'weekly',  label: 'Ventas Semanales',  desc: 'Ventas de una semana' },
  { key: 'monthly', label: 'Ventas Mensuales',  desc: 'Ventas de un mes' },
]

export default function Reportes() {
  const { profile } = useAuth()
  const [reportType, setReportType] = useState('daily')
  const [dateValue,  setDateValue]  = useState(new Date().toISOString().split('T')[0])
  const [loading,    setLoading]    = useState(false)
  const [preview,    setPreview]    = useState(null)

  const getDateRange = () => {
    const d = new Date(dateValue + 'T00:00:00')
    if (reportType === 'daily') {
      return {
        from:  d.toISOString().split('T')[0] + 'T00:00:00',
        to:    d.toISOString().split('T')[0] + 'T23:59:59',
        label: 'Dia: ' + d.toLocaleDateString('es-BO', { day: '2-digit', month: 'long', year: 'numeric' }),
      }
    }
    if (reportType === 'weekly') {
      const dayOfWeek = d.getDay()
      const monday = new Date(d)
      monday.setDate(d.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
      const sunday = new Date(monday)
      sunday.setDate(monday.getDate() + 6)
      return {
        from:  monday.toISOString().split('T')[0] + 'T00:00:00',
        to:    sunday.toISOString().split('T')[0] + 'T23:59:59',
        label: 'Semana: ' + monday.toLocaleDateString('es-BO') + ' - ' + sunday.toLocaleDateString('es-BO'),
      }
    }
    if (reportType === 'monthly') {
      const year  = d.getFullYear()
      const month = d.getMonth()
      const first = new Date(year, month, 1)
      const last  = new Date(year, month + 1, 0)
      return {
        from:  first.toISOString().split('T')[0] + 'T00:00:00',
        to:    last.toISOString().split('T')[0]  + 'T23:59:59',
        label: d.toLocaleDateString('es-BO', { month: 'long', year: 'numeric' }),
      }
    }
  }

  const fetchData = () => {
    setLoading(true)
    try {
      const { from, to, label } = getDateRange()
      const { data } = db.getSales({ from, to, pageSize: 9999 })

      const normalSales  = data.filter(s => !s.is_admin_sale)
      const adminSales   = data.filter(s =>  s.is_admin_sale)
      const normalTotal  = normalSales.reduce((a, s) => a + Number(s.total_amount), 0)
      const adminTotal   = adminSales.reduce( (a, s) => a + Number(s.total_amount), 0)

      setPreview({ data, label, normalTotal, adminTotal, from, to })
    } catch (err) {
      toast.error('Error al cargar reporte')
    } finally {
      setLoading(false)
    }
  }

  const exportPDF = () => {
    if (!preview) return
    const doc      = new jsPDF()
    const now      = new Date()
    const adminName = profile ? `${profile.first_name} ${profile.last_name}` : '-'

    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('BROASTERIA BRENA - Reporte de Ventas', 105, 16, { align: 'center' })

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('Periodo: ' + preview.label, 105, 24, { align: 'center' })
    doc.text('Generado por: ' + adminName + '   Fecha: ' + now.toLocaleDateString('es-BO') + ' ' + now.toLocaleTimeString('es-BO'), 105, 30, { align: 'center' })

    const rows = preview.data.map(s => [
      s.receipt_number,
      new Date(s.created_at).toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }),
      s.employee_name,
      'Bs ' + Number(s.total_amount).toFixed(2),
      s.is_admin_sale ? 'CONSUMO INTERNO' : 'Normal',
    ])

    autoTable(doc, {
      startY: 36,
      head: [['N° Recibo', 'Fecha', 'Empleado', 'Total', 'Tipo']],
      body: rows,
      styles:     { fontSize: 8 },
      headStyles: { fillColor: [249, 115, 22] },
      didParseCell: (data) => {
        if (data.section === 'body' && data.cell.raw === 'CONSUMO INTERNO') {
          data.cell.styles.textColor = [249, 115, 22]
        }
      },
    })

    const finalY = doc.lastAutoTable.finalY + 8
    doc.setLineWidth(0.5)
    doc.line(14, finalY, 196, finalY)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('Subtotal ventas normales:', 14, finalY + 8)
    doc.text('Bs ' + preview.normalTotal.toFixed(2), 196, finalY + 8, { align: 'right' })
    doc.setTextColor(249, 115, 22)
    doc.text('Ventas admin (sin ingreso):', 14, finalY + 15)
    doc.text('Bs ' + preview.adminTotal.toFixed(2), 196, finalY + 15, { align: 'right' })
    doc.setTextColor(0)
    doc.line(14, finalY + 19, 196, finalY + 19)
    doc.setFont('helvetica', 'bold')
    doc.text('TOTAL INGRESOS REALES:', 14, finalY + 27)
    doc.text('Bs ' + preview.normalTotal.toFixed(2), 196, finalY + 27, { align: 'right' })

    doc.save('reporte-ventas-' + reportType + '-' + dateValue + '.pdf')
    toast.success('PDF generado correctamente')
  }

  return (
    <div className="p-6 flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center">
          <BarChart3 size={20} className="text-brand-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Reportes</h1>
          <p className="text-xs text-white/40">Generacion y exportacion de PDFs</p>
        </div>
      </div>

      {/* Controles */}
      <div className="card flex flex-wrap items-end gap-4">
        {/* Tipo de reporte */}
        <div className="flex flex-col gap-2">
          <p className="text-xs text-white/40 uppercase tracking-wide font-medium">Tipo de Reporte</p>
          <div className="flex gap-2">
            {REPORT_TYPES.map(rt => (
              <button
                key={rt.key}
                onClick={() => setReportType(rt.key)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                  reportType === rt.key
                    ? 'bg-brand-500 text-white shadow-brand'
                    : 'bg-surface-400 text-white/50 hover:text-white hover:bg-surface-300 border border-white/8'
                }`}
              >
                {rt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Fecha */}
        <div className="flex flex-col gap-2">
          <p className="text-xs text-white/40 uppercase tracking-wide font-medium">
            {reportType === 'monthly' ? 'Mes' : 'Fecha de referencia'}
          </p>
          <input
            type={reportType === 'monthly' ? 'month' : 'date'}
            value={reportType === 'monthly' ? dateValue.slice(0, 7) : dateValue}
            onChange={e => setDateValue(reportType === 'monthly' ? e.target.value + '-01' : e.target.value)}
            className="input-base w-44"
            style={{ colorScheme: 'dark' }}
          />
        </div>

        <Button variant="primary" onClick={fetchData} loading={loading}>
          Generar Reporte
        </Button>
      </div>

      {/* Preview */}
      {preview && (
        <div className="flex flex-col gap-4 animate-fade-in">
          {/* Resumen */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-white">Reporte: {preview.label}</h2>
              <p className="text-xs text-white/40 mt-0.5">{preview.data.length} ventas encontradas</p>
            </div>
            <Button variant="primary" onClick={exportPDF} disabled={preview.data.length === 0}>
              <FileDown size={16} />
              Exportar PDF
            </Button>
          </div>

          {/* Totales */}
          <div className="grid grid-cols-3 gap-4">
            <div className="card text-center">
              <p className="text-xs text-white/40 mb-1">Ventas Normales</p>
              <p className="text-2xl font-bold text-emerald-400">Bs {preview.normalTotal.toFixed(2)}</p>
              <p className="text-xs text-white/30 mt-0.5">{preview.data.filter(s => !s.is_admin_sale).length} ventas</p>
            </div>
            <div className="card text-center border-brand-500/20">
              <p className="text-xs text-white/40 mb-1 flex items-center justify-center gap-1">
                <AlertTriangle size={11} className="text-brand-400" /> Consumo Interno
              </p>
              <p className="text-2xl font-bold text-brand-400">Bs {preview.adminTotal.toFixed(2)}</p>
              <p className="text-xs text-white/30 mt-0.5">{preview.data.filter(s => s.is_admin_sale).length} ventas</p>
            </div>
            <div className="card text-center">
              <p className="text-xs text-white/40 mb-1">INGRESOS REALES</p>
              <p className="text-2xl font-bold text-white">Bs {preview.normalTotal.toFixed(2)}</p>
              <p className="text-xs text-white/30 mt-0.5">Total real</p>
            </div>
          </div>

          {/* Tabla preview */}
          {preview.data.length > 0 && (
            <div className="card p-0 overflow-hidden max-h-96 overflow-y-auto">
              <table className="table-base">
                <thead className="sticky top-0 bg-surface-50">
                  <tr>
                    <th>N° Recibo</th>
                    <th>Fecha</th>
                    <th>Empleado</th>
                    <th>Total</th>
                    <th>Tipo</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.data.map(sale => (
                    <tr key={sale.id} className={sale.is_admin_sale ? 'admin-sale-row' : ''}>
                      <td className="font-mono text-xs">{sale.receipt_number}</td>
                      <td className="text-xs text-white/60">
                        {new Date(sale.created_at).toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="text-white/80">{sale.employee_name}</td>
                      <td className={`font-semibold ${sale.is_admin_sale ? 'text-brand-400' : 'text-white'}`}>
                        Bs {Number(sale.total_amount).toFixed(2)}
                      </td>
                      <td>
                        {sale.is_admin_sale
                          ? <Badge variant="orange"><AlertTriangle size={10} />Interno</Badge>
                          : <Badge variant="green">Normal</Badge>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
