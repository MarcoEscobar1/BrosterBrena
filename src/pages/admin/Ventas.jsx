import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../../lib/mockDb'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'
import toast from 'react-hot-toast'
import { Receipt, Search, Eye, AlertTriangle, SlidersHorizontal, X } from 'lucide-react'

const PAGE_SIZE = 20

export default function Ventas() {
  const navigate = useNavigate()
  const [sales,      setSales]      = useState([])
  const [loading,    setLoading]    = useState(true)
  const [total,      setTotal]      = useState(0)
  const [page,       setPage]       = useState(0)
  const [showFilter, setShowFilter] = useState(false)

  const [search,     setSearch]     = useState('')
  const [filterType, setFilterType] = useState('all')
  const [dateFrom,   setDateFrom]   = useState('')
  const [dateTo,     setDateTo]     = useState('')

  const fetchSales = useCallback(() => {
    setLoading(true)
    try {
      const result = db.getSales({
        from:       dateFrom || undefined,
        to:         dateTo ? dateTo + 'T23:59:59' : undefined,
        search:     search || undefined,
        filterType: filterType !== 'all' ? filterType : undefined,
        page,
        pageSize: PAGE_SIZE,
      })
      setSales(result.data)
      setTotal(result.total)
    } catch {
      toast.error('Error cargando ventas')
    } finally {
      setLoading(false)
    }
  }, [page, search, filterType, dateFrom, dateTo])

  useEffect(() => { fetchSales() }, [fetchSales])

  const totalPages     = Math.ceil(total / PAGE_SIZE)
  const hasActiveFilter = search || filterType !== 'all' || dateFrom || dateTo

  const clearFilters = () => {
    setSearch(''); setFilterType('all'); setDateFrom(''); setDateTo(''); setPage(0)
  }

  const pageNormalTotal = sales.filter(s => !s.is_admin_sale).reduce((a, s) => a + Number(s.total_amount), 0)
  const pageAdminTotal  = sales.filter(s =>  s.is_admin_sale).reduce((a, s) => a + Number(s.total_amount), 0)

  return (
    <div className="p-4 md:p-6 flex flex-col gap-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="page-header-icon">
            <Receipt size={20} className="text-brand-400" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold text-white">Ventas</h1>
            <p className="text-xs text-white/40">{total} registradas</p>
          </div>
        </div>
        <button
          onClick={() => setShowFilter(f => !f)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
            showFilter || hasActiveFilter
              ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
              : 'bg-surface-400 text-white/60 hover:text-white border border-white/10'
          }`}
        >
          <SlidersHorizontal size={15} />
          <span className="hidden sm:inline">Filtros</span>
          {hasActiveFilter && (
            <span className="w-4 h-4 bg-brand-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">!</span>
          )}
        </button>
      </div>

      {/* Filtros (colapsable) */}
      {showFilter && (
        <div className="card flex flex-col gap-3 animate-slide-up">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              placeholder="Buscar N° recibo..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(0) }}
              className="input-base pl-9"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <select value={filterType} onChange={e => { setFilterType(e.target.value); setPage(0) }}
              className="input-base" style={{ colorScheme: 'dark' }}>
              <option value="all">Todas</option>
              <option value="normal">Solo normales</option>
              <option value="admin">Solo internas</option>
            </select>
            <button onClick={clearFilters} className="btn-ghost btn-sm flex items-center gap-1.5">
              <X size={13} />Limpiar
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-white/40 mb-1 block">Desde</label>
              <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(0) }}
                className="input-base" style={{ colorScheme: 'dark' }} />
            </div>
            <div>
              <label className="text-xs text-white/40 mb-1 block">Hasta</label>
              <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(0) }}
                className="input-base" style={{ colorScheme: 'dark' }} />
            </div>
          </div>
        </div>
      )}

      {/* Resumen */}
      {sales.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          <div className="card py-3 px-3 flex items-center gap-2">
            <span className="text-xs text-white/40 leading-tight">Ventas normales</span>
            <span className="font-bold text-white ml-auto">Bs {pageNormalTotal.toFixed(2)}</span>
          </div>
          <div className="card py-3 px-3 flex items-center gap-2">
            <AlertTriangle size={13} className="text-brand-400 shrink-0" />
            <span className="text-xs text-white/40 leading-tight">Interno</span>
            <span className="font-bold text-brand-400 ml-auto">Bs {pageAdminTotal.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Contenido */}
      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : sales.length === 0 ? (
        <div className="card text-center py-16 text-white/30">
          <Receipt size={40} strokeWidth={1} className="mx-auto mb-3" />
          <p>No se encontraron ventas</p>
        </div>
      ) : (
        <>
          {/* Cards en móvil */}
          <div className="sm:hidden flex flex-col gap-2">
            {sales.map(sale => (
              <div
                key={sale.id}
                className={`card flex items-center gap-3 py-3 ${sale.is_admin_sale ? 'border-l-2 border-brand-500 bg-brand-500/5' : ''}`}
              >
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-xs text-white/70">{sale.receipt_number}</p>
                  <p className="text-xs text-white/50 mt-0.5">
                    {new Date(sale.created_at).toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit' })}
                    {' · '}{sale.employee_name}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`font-bold text-sm ${sale.is_admin_sale ? 'text-brand-400' : 'text-white'}`}>
                      Bs {Number(sale.total_amount).toFixed(2)}
                    </span>
                    {sale.is_admin_sale
                      ? <Badge variant="orange"><AlertTriangle size={9} />Interno</Badge>
                      : <Badge variant="green">Normal</Badge>
                    }
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/admin/ventas/${sale.id}`)}
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors shrink-0"
                >
                  <Eye size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Tabla en tablet/desktop */}
          <div className="hidden sm:block card p-0 overflow-hidden">
            <div className="table-container">
              <table className="table-base">
                <thead>
                  <tr>
                    <th>N° Recibo</th>
                    <th>Fecha</th>
                    <th>Empleado</th>
                    <th>Total</th>
                    <th>Tipo</th>
                    <th className="!text-center">Accion</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map(sale => (
                    <tr key={sale.id} className={sale.is_admin_sale ? 'admin-sale-row' : ''}>
                      <td className="font-mono text-xs font-semibold text-white/80">{sale.receipt_number}</td>
                      <td className="text-white/60 text-xs whitespace-nowrap">
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
                        {sale.is_admin_sale
                          ? <Badge variant="orange"><AlertTriangle size={10} />Interno</Badge>
                          : <Badge variant="green">Normal</Badge>
                        }
                      </td>
                      <td>
                        <div className="flex justify-center">
                          <button
                            onClick={() => navigate(`/admin/ventas/${sale.id}`)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                          >
                            <Eye size={13} />Ver
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

      {/* Paginacion */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-white/40">
            {page + 1} / {totalPages} · {total} ventas
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 0}>← Ant.</Button>
            <Button variant="secondary" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}>Sig. →</Button>
          </div>
        </div>
      )}
    </div>
  )
}
