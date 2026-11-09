import { localDate } from '../../lib/dates'
import { Link } from 'react-router-dom'
import { db } from '../../lib/mockDb'
import { useAuth } from '../../context/AuthContext'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import { Receipt, Eye, AlertTriangle } from 'lucide-react'

export default function MisVentas() {
  const { profile } = useAuth()
  const sales = profile ? db.getSalesByEmployee(profile.id, localDate() + 'T00:00:00') : []
  const loading = false

  const total = sales.filter(s => !s.is_admin_sale).reduce((a, s) => a + Number(s.total_amount), 0)

  return (
    <div className="p-4 md:p-6 flex flex-col gap-4 ">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-lg md:text-xl font-bold text-ink">Mis Ventas del Dia</h1>
            <p className="text-xs text-muted">Solo tus ventas de hoy</p>
          </div>
        </div>
        <div className="card py-2 px-3 text-right shrink-0">
          <p className="text-xs text-muted">Total</p>
          <p className="text-base font-bold text-success">Bs {total.toFixed(2)}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : sales.length === 0 ? (
        <div className="card text-center py-16 text-muted">
          <p>Aun no tienes ventas hoy</p>
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
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-xs text-muted">{sale.receipt_number}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`font-bold text-sm ${sale.is_admin_sale ? 'text-brand-700' : 'text-ink'}`}>
                      Bs {Number(sale.total_amount).toFixed(2)}
                    </span>
                    <span className="text-xs text-muted">
                      {new Date(sale.created_at).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {sale.is_admin_sale
                      ? <Badge variant="orange"><AlertTriangle aria-hidden="true" size={9} />Interno</Badge>
                      : <Badge variant="green">Normal</Badge>
                    }
                  </div>
                </div>
                <Link aria-label={`Ver venta ${sale.receipt_number}`} to={`/empleado/ventas/${sale.id}`}
                  className="p-2.5 rounded-xl bg-ink/5 text-muted hover:text-ink shrink-0"
                >
                  <Eye aria-hidden="true" size={16} />
                </Link>
              </div>
            ))}
          </div>

          {/* Tabla en sm+ */}
          <div className="hidden sm:block card p-0 overflow-hidden">
            <div className="table-container">
              <table className="table-base">
                <thead>
                  <tr>
                    <th>N° Recibo</th>
                    <th>Hora</th>
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
                        {new Date(sale.created_at).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })}
                      </td>
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
                          <Link aria-label={`Ver venta ${sale.receipt_number}`} to={`/empleado/ventas/${sale.id}`}
                            className="p-1.5 rounded-lg hover:bg-ink/5 text-muted hover:text-ink transition-colors"
                          >
                            <Eye aria-hidden="true" size={14} />
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
    </div>
  )
}
