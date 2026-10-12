import { localDate } from '../../lib/dates'
import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../../lib/mockDb'
import Spinner from '../../components/ui/Spinner'
import Badge from '../../components/ui/Badge'
import {
  AlertTriangle, Eye, RefreshCw
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts'

const PERIODS = [
  { key: 'today',  label: 'Hoy' },
  { key: 'week',   label: 'Semana' },
  { key: 'month',  label: 'Mes' },
]

function getDateRange(period) {
  const now = new Date()
  if (period === 'today') {
    const d = localDate(now)
    return { from: d + 'T00:00:00', to: d + 'T23:59:59.999' }
  }
  if (period === 'week') {
    const dayOfWeek = now.getDay()
    const monday = new Date(now)
    monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
    monday.setHours(0, 0, 0, 0)
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    sunday.setHours(23, 59, 59, 999)
    return { from: monday.toISOString(), to: sunday.toISOString() }
  }
  if (period === 'month') {
    const y = now.getFullYear(), m = now.getMonth()
    return {
      from: new Date(y, m, 1).toISOString(),
      to:   new Date(y, m + 1, 0, 23, 59, 59).toISOString(),
    }
  }
}

function MetricCard({ label, value, sub, color = 'brand' }) {
  const colors = { brand: 'text-white', green: 'text-emerald-400', yellow: 'text-yellow-400', red: 'text-red-400' }
  return (
    <div className="card">
      <p className="text-sm text-white/70">{label}</p>
      <p className={`text-xl sm:text-2xl font-semibold mt-1 tabular-nums break-words ${colors[color]}`}>{value}</p>
      {sub && <p className="text-xs text-white/60 mt-1">{sub}</p>}
    </div>
  )
}

export default function Dashboard() {
  const navigate  = useNavigate()
  const [period,  setPeriod]  = useState('today')
  const [refresh, setRefresh] = useState(0)
  const loading = false
  const fetchDashboard = () => setRefresh(value => value + 1)
  const data = useMemo(() => {
    void refresh
    try {
      const { from, to } = getDateRange(period)
      const { sales, byEmployee, inventory } = db.getDashboardData({ from, to })
      const lastSales = db.getLastSales(8)

      const normalSales  = sales.filter(s => !s.is_admin_sale)
      const income       = normalSales.reduce((a, s) => a + Number(s.total_amount), 0)
      const transactions = sales.length

      const grouped = {}
      sales.forEach(s => {
        const key = period === 'today'
          ? new Date(s.created_at).toLocaleTimeString('es-BO', { hour: '2-digit' }) + 'h'
          : new Date(s.created_at).toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit' })
        if (!grouped[key]) grouped[key] = { name: key, normal: 0, admin: 0 }
        if (s.is_admin_sale) grouped[key].admin  += Number(s.total_amount)
        else                 grouped[key].normal += Number(s.total_amount)
      })

      return { income, transactions, byEmployee, chartData: Object.values(grouped), stock: inventory, lastSales }
    } catch {
      return { income: 0, transactions: 0, byEmployee: [], chartData: [], stock: [], lastSales: [] }
    }
  }, [period, refresh])

  const stockItem   = data.stock.find(s => s.slug === 'chicken_pieces')
  const stockStatus = stockItem
    ? (stockItem.quantity === 0 ? 'red' : stockItem.quantity <= stockItem.min_stock ? 'yellow' : 'green')
    : 'yellow'

  return (
    <div className="p-4 md:p-6 flex flex-col gap-4 md:gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-lg md:text-xl font-bold text-white">Inicio</h1>
            <p className="text-xs text-white/60 hidden sm:block">Métricas del negocio</p>
          </div>
        </div>
        <div className="flex gap-1.5 items-center">
          {/* Selector de periodo */}
          <div className="flex gap-0.5 bg-surface-400 p-1 rounded-xl">
            {PERIODS.map(p => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                  period === p.key
                    ? 'bg-brand-500 text-white'
                    : 'text-white/50 hover:text-white hover:bg-white/8'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button
            onClick={fetchDashboard}
            className="p-2 rounded-xl hover:bg-white/8 text-white/60 hover:text-white transition-colors"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : (
        <>
          {/* Metricas: 2 col en móvil, 4 en xl */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
            <MetricCard
              label="Ingresos" color="green"
              value={`Bs ${data.income.toFixed(2)}`}
              sub="Ventas normales"
            />
            <MetricCard
              label="Transacciones" color="brand"
              value={data.transactions}
              sub="Ventas del periodo"
            />
            <MetricCard
              label="Empleados" color="brand"
              value={data.byEmployee.length}
            />
            <MetricCard
              label="Presas" color={stockStatus}
              value={stockItem ? Math.floor(stockItem.quantity) : '-'}
              sub={stockItem ? `Min: ${stockItem.min_stock}` : 'Sin datos'}
            />
          </div>

          {/* Grafico + Por empleado */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            {/* Grafico */}
            <div className="card xl:col-span-2">
              <p className="font-semibold text-white mb-3 text-sm">Ventas por periodo</p>
              {data.chartData.length === 0 ? (
                <div className="flex items-center justify-center h-40 text-white/60">
                  <p className="text-sm">Sin datos para este periodo</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={data.chartData} margin={{ top: 0, right: 0, bottom: 0, left: -15 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: '#252525', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                      labelStyle={{ color: '#fff', fontWeight: 600 }}
                      cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                      formatter={(v, n) => [`Bs ${v.toFixed(2)}`, n === 'normal' ? 'Normales' : 'Interno']}
                    />
                    <Legend
                      formatter={v => <span style={{ fontSize: 11 }}>{v === 'normal' ? 'Ventas normales' : 'Consumo interno'}</span>}
                    />
                    <Bar dataKey="normal" fill="#e30a17" radius={[4,4,0,0]} />
                    <Bar dataKey="admin"  fill="#ff6b6b" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Por empleado */}
            <div className="card flex flex-col gap-3">
              <p className="font-semibold text-white text-sm">Hoy por empleado</p>
              {data.byEmployee.length === 0 ? (
                <p className="text-white/60 text-sm">Sin ventas hoy</p>
              ) : (
                data.byEmployee
                  .filter(e => e.total_transactions > 0)
                  .map(e => (
                    <div key={e.employee_id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                      <div className="min-w-0 mr-2">
                        <p className="text-sm font-medium text-white truncate">{e.employee_name}</p>
                        <p className="text-xs text-white/60">{e.total_transactions} ventas</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-emerald-400">Bs {Number(e.real_income).toFixed(2)}</p>
                        {Number(e.admin_consumption) > 0 && (
                          <p className="text-xs text-brand-400">+{Number(e.admin_consumption).toFixed(2)} int.</p>
                        )}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>

          {/* Ultimas ventas */}
          <div className="card p-0 overflow-hidden">
            <div className="flex items-center justify-between px-4 md:px-5 py-3 md:py-4 border-b border-white/8">
              <h2 className="font-semibold text-white text-sm">Ultimas Ventas</h2>
              <button
                onClick={() => navigate('/admin/ventas')}
                className="text-xs text-brand-400 hover:text-brand-300 transition-colors"
              >
                Ver todas →
              </button>
            </div>

            {/* Cards en móvil, tabla en desktop */}
            <div className="sm:hidden flex flex-col divide-y divide-white/5">
              {data.lastSales.map(sale => (
                <div
                  key={sale.id}
                  className={`flex items-center justify-between px-4 py-3 ${sale.is_admin_sale ? 'bg-brand-500/5 border-l border-brand-500' : ''}`}
                >
                  <div className="min-w-0 mr-3">
                    <p className="font-mono text-xs text-white/70 truncate">{sale.receipt_number}</p>
                    <p className="text-xs text-white/50 mt-0.5 truncate">{sale.employee_name}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`font-bold text-sm ${sale.is_admin_sale ? 'text-brand-400' : 'text-white'}`}>
                      Bs {Number(sale.total_amount).toFixed(2)}
                    </span>
                    <button
                      onClick={() => navigate(`/admin/ventas/${sale.id}`)}
                      className="p-1.5 rounded-lg bg-white/5 text-white/50 hover:text-white"
                    >
                      <Eye size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden sm:block table-container">
              <table className="table-base">
                <thead>
                  <tr>
                    <th>N° Recibo</th>
                    <th>Empleado</th>
                    <th>Total</th>
                    <th>Tipo</th>
                    <th className="text-right">Accion</th>
                  </tr>
                </thead>
                <tbody>
                  {data.lastSales.map(sale => (
                    <tr key={sale.id} className={sale.is_admin_sale ? 'admin-sale-row' : ''}>
                      <td className="font-mono text-xs text-white/80">{sale.receipt_number}</td>
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
                      <td>
                        <div className="flex justify-end">
                          <button
                            onClick={() => navigate(`/admin/ventas/${sale.id}`)}
                            className="p-1.5 rounded-lg hover:bg-white/8 text-white/60 hover:text-white transition-colors"
                          >
                            <Eye size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
