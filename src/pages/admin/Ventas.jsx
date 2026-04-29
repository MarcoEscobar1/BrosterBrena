import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'
import toast from 'react-hot-toast'
import { Receipt, Search, Eye, AlertTriangle } from 'lucide-react'

const PAGE_SIZE = 20

export default function Ventas() {
  const navigate = useNavigate()
  const [sales,      setSales]      = useState([])
  const [profiles,   setProfiles]   = useState([])
  const [loading,    setLoading]    = useState(true)
  const [total,      setTotal]      = useState(0)
  const [page,       setPage]       = useState(0)

  // Filtros
  const [search,     setSearch]     = useState('')
  const [filterEmp,  setFilterEmp]  = useState('all')
  const [filterType, setFilterType] = useState('all') // all | normal | admin
  const [dateFrom,   setDateFrom]   = useState('')
  const [dateTo,     setDateTo]     = useState('')

  // Cargar empleados para el filtro
  useEffect(() => {
    supabase.from('profiles').select('id, first_name, last_name').eq('is_active', true)
      .then(({ data }) => setProfiles(data ?? []))
  }, [])

  const fetchSales = useCallback(async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('v_sales_detail')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

      if (search)     query = query.ilike('receipt_number', `%${search}%`)
      if (filterEmp !== 'all') {
        // filtramos por employee_id desde la vista
        // Necesitamos join directo; usamos sales tabla
      }
      if (filterType === 'normal') query = query.eq('is_admin_sale', false)
      if (filterType === 'admin')  query = query.eq('is_admin_sale', true)
      if (dateFrom)   query = query.gte('created_at', dateFrom)
      if (dateTo)     query = query.lte('created_at', dateTo + 'T23:59:59')

      const { data, error, count } = await query
      if (error) throw error
      setSales(data ?? [])
      setTotal(count ?? 0)
    } catch (err) {
      toast.error('Error cargando ventas')
    } finally {
      setLoading(false)
    }
  }, [page, search, filterEmp, filterType, dateFrom, dateTo])

  useEffect(() => { fetchSales() }, [fetchSales])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  // Calcular totales de la página
  const pageNormalTotal = sales.filter(s => !s.is_admin_sale).reduce((a, s) => a + Number(s.total_amount), 0)
  const pageAdminTotal  = sales.filter(s =>  s.is_admin_sale).reduce((a, s) => a + Number(s.total_amount), 0)

  return (
    <div className="p-6 flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center">
          <Receipt size={20} className="text-brand-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Historial de Ventas</h1>
          <p className="text-xs text-white/40">{total} ventas registradas</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            placeholder="Buscar N° recibo..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0) }}
            className="input-base pl-9 w-44"
          />
        </div>
        <select value={filterType} onChange={e => { setFilterType(e.target.value); setPage(0) }}
          className="input-base w-36" style={{ colorScheme: 'dark' }}>
          <option value="all">Todas</option>
          <option value="normal">Solo normales</option>
          <option value="admin">Solo admin</option>
        </select>
        <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(0) }}
          className="input-base w-40" style={{ colorScheme: 'dark' }} />
        <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(0) }}
          className="input-base w-40" style={{ colorScheme: 'dark' }} />
        <button onClick={() => { setSearch(''); setFilterEmp('all'); setFilterType('all'); setDateFrom(''); setDateTo(''); setPage(0) }}
          className="btn-ghost btn-sm">
          Limpiar
        </button>
      </div>

      {/* Resumen de página */}
      {sales.length > 0 && (
        <div className="flex gap-4">
          <div className="card py-3 px-4 flex items-center gap-2">
            <span className="text-xs text-white/40">Ventas normales (página):</span>
            <span className="font-bold text-white">Bs {pageNormalTotal.toFixed(2)}</span>
          </div>
          <div className="card py-3 px-4 flex items-center gap-2">
            <AlertTriangle size={14} className="text-brand-400" />
            <span className="text-xs text-white/40">Consumo interno:</span>
            <span className="font-bold text-brand-400">Bs {pageAdminTotal.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Tabla */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : sales.length === 0 ? (
          <div className="text-center py-16 text-white/30">
            <Receipt size={40} strokeWidth={1} className="mx-auto mb-3" />
            <p>No se encontraron ventas</p>
          </div>
        ) : (
          <table className="table-base">
            <thead>
              <tr>
                <th>N° Recibo</th>
                <th>Fecha</th>
                <th>Empleado</th>
                <th>Total</th>
                <th>Tipo</th>
                <th className="!text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sales.map(sale => (
                <tr
                  key={sale.id}
                  className={sale.is_admin_sale ? 'admin-sale-row' : ''}
                >
                  <td>
                    <p className="font-mono text-xs font-semibold text-white/80">
                      {sale.receipt_number}
                    </p>
                  </td>
                  <td className="text-white/60 text-xs">
                    {new Date(sale.created_at).toLocaleDateString('es-BO', {
                      day: '2-digit', month: '2-digit', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </td>
                  <td className="text-white/80">{sale.employee_name}</td>
                  <td>
                    <span className={`font-bold ${sale.is_admin_sale ? 'text-brand-400' : 'text-white'}`}>
                      Bs {Number(sale.total_amount).toFixed(2)}
                    </span>
                  </td>
                  <td>
                    {sale.is_admin_sale ? (
                      <Badge variant="orange">
                        <AlertTriangle size={10} />
                        Consumo Interno
                      </Badge>
                    ) : (
                      <Badge variant="green">Normal</Badge>
                    )}
                  </td>
                  <td>
                    <div className="flex justify-center">
                      <button
                        onClick={() => navigate(`/admin/ventas/${sale.id}`)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                      >
                        <Eye size={13} />
                        Ver
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-white/40">
            Página {page + 1} de {totalPages} · {total} ventas totales
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 0}>
              ← Anterior
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}>
              Siguiente →
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
