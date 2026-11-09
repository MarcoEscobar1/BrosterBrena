import { useState, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { db } from '../../lib/mockDb'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'
import { Receipt, Search, Eye, AlertTriangle, SlidersHorizontal, X } from 'lucide-react'

const PAGE_SIZE = 20

export default function Ventas() {
  const loading = false
  const [params,setParams] = useSearchParams()
  const page = Math.max(0, Number(params.get('page')) || 0)
  const changeFilters = patch => setParams(previous => {
    const next = new URLSearchParams(previous)
    for (const [key,value] of Object.entries(patch)) {
      if (!value || value === 'all') next.delete(key); else next.set(key,String(value))
    }
    return next
  }, {replace:true})
  const [showFilter, setShowFilter] = useState(() => Boolean(params.size))

  const search = params.get('search') || ''
  const filterType = params.get('filterType') || 'all'
  const dateFrom = params.get('dateFrom') || ''
  const dateTo = params.get('dateTo') || ''

  const { data: sales, total } = useMemo(() => db.getSales({
    from: dateFrom ? dateFrom + 'T00:00:00' : undefined,
    to: dateTo ? dateTo + 'T23:59:59.999' : undefined,
    search: search || undefined,
    filterType: filterType !== 'all' ? filterType : undefined,
    page,
    pageSize: PAGE_SIZE,
  }), [page, search, filterType, dateFrom, dateTo])

  const totalPages     = Math.ceil(total / PAGE_SIZE)
  const hasActiveFilter = search || filterType !== 'all' || dateFrom || dateTo

  const clearFilters = () => {
    setParams({}, {replace:true})
  }

  const pageNormalTotal = sales.filter(s => !s.is_admin_sale).reduce((a, s) => a + Number(s.total_amount), 0)
  const pageAdminTotal  = sales.filter(s =>  s.is_admin_sale).reduce((a, s) => a + Number(s.total_amount), 0)

  return (
    <div className="p-4 md:p-6 flex flex-col gap-4 ">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-lg md:text-xl font-bold text-ink">Ventas</h1>
            <p className="text-xs text-muted">{total} registradas</p>
          </div>
        </div>
        <button
          aria-label="Mostrar filtros" aria-expanded={showFilter} onClick={() => setShowFilter(f => !f)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
            showFilter || hasActiveFilter
              ? 'bg-brand-500/20 text-brand-700 border border-brand-500/30'
              : 'bg-surface-400 text-muted hover:text-ink border border-line'
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
        <div className="card flex flex-col gap-3 ">
          <div className="relative">
            <Search aria-hidden="true" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input name="search" autoComplete="off" aria-label="Buscar N° recibo" placeholder="Buscar N° recibo…"
              value={search}
              onChange={e => { changeFilters({search:e.target.value,page:0}) }}
              className="input-base pl-9"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <select aria-label="Tipo de venta" name="sale-type" value={filterType} onChange={e => { changeFilters({filterType:e.target.value,page:0}) }}
              className="input-base" >
              <option value="all">Todas</option>
              <option value="normal">Solo normales</option>
              <option value="admin">Solo internas</option>
            </select>
            <button onClick={clearFilters} className="btn-ghost btn-sm flex items-center gap-1.5">
              <X aria-hidden="true" size={13} />Limpiar
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="date-from" className="text-xs text-muted mb-1 block">Desde</label>
              <input id="date-from" name="date-from" type="date" value={dateFrom} onChange={e => { changeFilters({dateFrom:e.target.value,page:0}) }}
                className="input-base"  />
            </div>
            <div>
              <label htmlFor="date-to" className="text-xs text-muted mb-1 block">Hasta</label>
              <input id="date-to" name="date-to" type="date" value={dateTo} onChange={e => { changeFilters({dateTo:e.target.value,page:0}) }}
                className="input-base"  />
            </div>
          </div>
        </div>
      )}

      {/* Resumen */}
      {sales.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          <div className="card py-3 px-3 flex items-center gap-2">
            <span className="text-xs text-muted leading-tight">Ventas normales</span>
            <span className="font-bold text-ink ml-auto">Bs {pageNormalTotal.toFixed(2)}</span>
          </div>
          <div className="card py-3 px-3 flex items-center gap-2">
            <AlertTriangle aria-hidden="true" size={13} className="text-brand-700 shrink-0" />
            <span className="text-xs text-muted leading-tight">Interno</span>
            <span className="font-bold text-brand-700 ml-auto">Bs {pageAdminTotal.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Contenido */}
      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : sales.length === 0 ? (
        <div className="card text-center py-16 text-muted">
          <p>No se encontraron ventas</p>
        </div>
      ) : (
        <>
          {/* Cards en móvil */}
          <div className="sm:hidden flex flex-col gap-2">
            {sales.map(sale => (
              <div
                key={sale.id}
                className={`card flex items-center gap-3 py-3 ${sale.is_admin_sale ? 'border-l border-brand-500 bg-brand-500/5' : ''}`}
              >
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-xs text-muted">{sale.receipt_number}</p>
                  <p className="text-xs text-muted mt-0.5">
                    {new Date(sale.created_at).toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit' })}
                    {' · '}{sale.employee_name}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`font-bold text-sm ${sale.is_admin_sale ? 'text-brand-700' : 'text-ink'}`}>
                      Bs {Number(sale.total_amount).toFixed(2)}
                    </span>
                    {sale.is_admin_sale
                      ? <Badge variant="orange"><AlertTriangle aria-hidden="true" size={9} />Interno</Badge>
                      : <Badge variant="green">Normal</Badge>
                    }
                  </div>
                </div>
                <Link aria-label={`Ver venta ${sale.receipt_number}`} to={`/admin/ventas/${sale.id}`}
                  className="p-2.5 rounded-xl bg-ink/5 hover:bg-ink/5 text-muted hover:text-ink transition-colors shrink-0"
                >
                  <Eye aria-hidden="true" size={16} />
                </Link>
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
                      <td className="font-mono text-xs font-semibold text-ink">{sale.receipt_number}</td>
                      <td className="text-muted text-xs whitespace-nowrap">
                        {new Date(sale.created_at).toLocaleDateString('es-BO', {
                          day: '2-digit', month: '2-digit', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </td>
                      <td className="text-ink">{sale.employee_name}</td>
                      <td>
                        <span className={`font-bold ${sale.is_admin_sale ? 'text-brand-700' : 'text-ink'}`}>
                          Bs {Number(sale.total_amount).toFixed(2)}
                        </span>
                      </td>
                      <td>
                        {sale.is_admin_sale
                          ? <Badge variant="orange"><AlertTriangle aria-hidden="true" size={10} />Interno</Badge>
                          : <Badge variant="green">Normal</Badge>
                        }
                      </td>
                      <td>
                        <div className="flex justify-center">
                          <Link aria-label={`Ver venta ${sale.receipt_number}`} to={`/admin/ventas/${sale.id}`}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-ink/5 hover:bg-ink/5 text-muted hover:text-ink transition-colors"
                          >
                            <Eye aria-hidden="true" size={13} />Ver
                          </Link>
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
          <p className="text-xs text-muted">
            {page + 1} / {totalPages} · {total} ventas
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => changeFilters({page:page-1})} disabled={page === 0}>Anterior</Button>
            <Button variant="secondary" size="sm" onClick={() => changeFilters({page:page+1})} disabled={page >= totalPages - 1}>Siguiente</Button>
          </div>
        </div>
      )}
    </div>
  )
}
