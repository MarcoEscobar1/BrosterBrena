import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../../lib/mockDb'
import Spinner from '../../components/ui/Spinner'
import Badge from '../../components/ui/Badge'
import {
  LayoutDashboard, TrendingUp, ShoppingCart, Users,
  Warehouse, AlertTriangle, Eye, RefreshCw
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts'
import toast from 'react-hot-toast'

const PERIODS = [
  { key: 'today',  label: 'Hoy' },
  { key: 'week',   label: 'Esta semana' },
  { key: 'month',  label: 'Este mes' },
]

function getDateRange(period) {
  const now = new Date()
  if (period === 'today') {
    const d = now.toISOString().split('T')[0]
    return { from: d + 'T00:00:00', to: d + 'T23:59:59' }
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

function MetricCard({ icon: Icon, label, value, sub, color = 'brand' }) {
  const colors = {
    brand:  'text-brand-400 bg-brand-500/15 border-brand-500/30',
    green:  'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
    yellow: 'text-yellow-400 bg-yellow-500/15 border-yellow-500/30',
    red:    'text-red-400 bg-red-500/15 border-red-500/30',
  }
  return (
    <div className="card flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 ${colors[color]}`}>
        <Icon size={22} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-white/40 uppercase tracking-wide font-medium">{label}</p>
        <p className="text-2xl font-bold text-white mt-0.5 truncate">{value}</p>
        {sub && <p className="text-xs text-white/40 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const navigate  = useNavigate()
  const [period,  setPeriod]  = useState('today')
  const [loading, setLoading] = useState(true)
  const [data,    setData]    = useState({
    income:       0,
    transactions: 0,
    byEmployee:   [],
    chartData:    [],
    stock:        [],
    lastSales:    [],
  })

  const fetchDashboard = () => {
    setLoading(true)
    try {
      const { from, to } = getDateRange(period)
      const { sales, byEmployee, inventory } = db.getDashboardData({ from, to })
      const lastSales = db.getLastSales(8)

      const normalSales  = sales.filter(s => !s.is_admin_sale)
      const income       = normalSales.reduce((a, s) => a + Number(s.total_amount), 0)
      const transactions = sales.length

      // Datos para el grafico
      const grouped = {}
      sales.forEach(s => {
        const key = period === 'today'
          ? new Date(s.created_at).toLocaleTimeString('es-BO', { hour: '2-digit' }) + 'h'
          : new Date(s.created_at).toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit' })
        if (!grouped[key]) grouped[key] = { name: key, normal: 0, admin: 0 }
        if (s.is_admin_sale) grouped[key].admin  += Number(s.total_amount)
        else                 grouped[key].normal += Number(s.total_amount)
      })
      const chartData = Object.values(grouped)

      setData({ income, transactions, byEmployee, chartData, stock: inventory, lastSales })
    } catch (err) {
      toast.error('Error cargando dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchDashboard() }, [period])

  const stockItem  = data.stock.find(s => s.slug === 'chicken_pieces')
  const stockStatus = stockItem
    ? (stockItem.quantity === 0 ? 'red' : stockItem.quantity <= stockItem.min_stock ? 'yellow' : 'green')
    : 'yellow'

  return (
    <div className="p-6 flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center">
            <LayoutDashboard size={20} className="text-brand-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Dashboard</h1>
            <p className="text-xs text-white/40">Metricas del negocio</p>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          {/* Selector de periodo */}
          <div className="flex gap-1 bg-surface-400 p-1 rounded-xl">
            {PERIODS.map(p => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
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
            className="p-2 rounded-xl hover:bg-white/8 text-white/40 hover:text-white transition-colors"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : (
        <>
          {/* Metricas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <MetricCard
              icon={TrendingUp} label="Ingresos del periodo" color="green"
              value={`Bs ${data.income.toFixed(2)}`}
              sub="Solo ventas normales"
            />
            <MetricCard
              icon={ShoppingCart} label="Transacciones" color="brand"
              value={data.transactions}
              sub="Ventas registradas"
            />
            <MetricCard
              icon={Users} label="Empleados activos" color="brand"
              value={data.byEmployee.length}
            />
            <MetricCard
              icon={Warehouse} label="Stock de presas" color={stockStatus}
              value={stockItem ? Math.floor(stockItem.quantity) : '-'}
              sub={stockItem ? `Minimo: ${stockItem.min_stock}` : 'Sin datos'}
            />
          </div>

          {/* Grafico + Ventas por empleado */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            {/* Grafico */}
            <div className="card xl:col-span-2">
              <p className="font-semibold text-white mb-4">Ventas por periodo</p>
              {data.chartData.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-white/30">
                  <p className="text-sm">Sin datos para este periodo</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={data.chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: '#252525', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                      labelStyle={{ color: '#fff', fontWeight: 600 }}
                      cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                      formatter={(v, n) => [`Bs ${v.toFixed(2)}`, n === 'normal' ? 'Ventas normales' : 'Consumo interno']}
                    />
                    <Legend formatter={v => v === 'normal' ? 'Ventas normales' : 'Consumo interno'} />
                    <Bar dataKey="normal" fill="#f97316" radius={[6,6,0,0]} />
                    <Bar dataKey="admin"  fill="rgba(249,115,22,0.3)" radius={[6,6,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Por empleado */}
            <div className="card flex flex-col gap-3">
              <p className="font-semibold text-white">Ventas del dia — Por empleado</p>
              {data.byEmployee.length === 0 ? (
                <p className="text-white/30 text-sm">Sin datos</p>
              ) : (
                data.byEmployee
                  .filter(e => e.total_transactions > 0)
                  .map(e => (
                    <div key={e.employee_id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-white">{e.employee_name}</p>
                        <p className="text-xs text-white/40">{e.total_transactions} ventas</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-emerald-400">Bs {Number(e.real_income).toFixed(2)}</p>
                        {Number(e.admin_consumption) > 0 && (
                          <p className="text-xs text-brand-400">+Bs {Number(e.admin_consumption).toFixed(2)} interno</p>
                        )}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>

          {/* Ultimas ventas */}
          <div className="card p-0 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
              <h2 className="font-semibold text-white">Ultimas Ventas</h2>
              <button
                onClick={() => navigate('/admin/ventas')}
                className="text-xs text-brand-400 hover:text-brand-300 transition-colors"
              >
                Ver todas →
              </button>
            </div>
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
          </div>
        </>
      )}
    </div>
  )
}
