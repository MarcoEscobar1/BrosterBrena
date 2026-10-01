import { useState, useEffect } from 'react'
import { db } from '../../lib/mockDb'
import { useAuth } from '../../context/AuthContext'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import toast from 'react-hot-toast'
import { Plus, Pencil, Package, Search } from 'lucide-react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const productSchema = z.object({
  name:                    z.string().min(1, 'El nombre es obligatorio').trim(),
  description:             z.string().optional(),
  price:                   z.coerce.number().min(0.01, 'El precio debe ser mayor a 0'),
  category:                z.enum(['plato', 'refresco', 'extra'], { required_error: 'Selecciona una categoria' }),
  chicken_pieces_required: z.coerce.number().int().min(0, 'No puede ser negativo'),
  is_active:               z.boolean().optional(),
})

const CATEGORY_LABELS   = { plato: 'Plato', refresco: 'Refresco', extra: 'Extra' }
const CATEGORY_VARIANTS = { plato: 'orange', refresco: 'purple', extra: 'yellow' }

export default function Productos() {
  const [products,  setProducts]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState('')
  const [filterCat, setFilterCat] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing,   setEditing]   = useState(null)
  const [saving,    setSaving]    = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: { is_active: true, chicken_pieces_required: 0, category: 'plato' },
  })

  const fetchProducts = () => {
    setLoading(true)
    setProducts(db.getProducts())
    setLoading(false)
  }

  useEffect(() => { fetchProducts() }, [])

  const openCreate = () => {
    setEditing(null)
    reset({ is_active: true, chicken_pieces_required: 0, category: 'plato' })
    setModalOpen(true)
  }

  const openEdit = (product) => {
    setEditing(product)
    reset({
      name:                    product.name,
      description:             product.description ?? '',
      price:                   product.price,
      category:                product.category,
      chicken_pieces_required: product.chicken_pieces_required,
      is_active:               product.is_active,
    })
    setModalOpen(true)
  }

  const onSubmit = async (values) => {
    setSaving(true)
    try {
      if (editing) {
        const r = db.updateProduct(editing.id, values)
        if (r.error) throw new Error(r.error)
        toast.success('Producto actualizado')
      } else {
        const r = db.createProduct(values)
        if (r.error) throw new Error(r.error)
        toast.success('Producto creado')
      }
      setModalOpen(false)
      fetchProducts()
    } catch (err) {
      toast.error(err.message || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = (product) => {
    const r = db.updateProduct(product.id, { is_active: !product.is_active })
    if (r.error) { toast.error('Error al actualizar'); return }
    toast.success(product.is_active ? 'Desactivado' : 'Activado')
    fetchProducts()
  }

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchCat    = filterCat === 'all' || p.category === filterCat
    return matchSearch && matchCat
  })

  return (
    <div className="p-4 md:p-6 flex flex-col gap-4 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-header-icon">
            <Package size={20} className="text-brand-400" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold text-white">Productos</h1>
            <p className="text-xs text-white/40">{products.length} registrados</p>
          </div>
        </div>
        <Button variant="primary" onClick={openCreate} className="w-full sm:w-auto">
          <Plus size={16} />Nuevo Producto
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            placeholder="Buscar producto..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-base pl-9"
          />
        </div>
        <select
          value={filterCat}
          onChange={e => setFilterCat(e.target.value)}
          className="input-base sm:w-44"
          style={{ colorScheme: 'dark' }}
        >
          <option value="all">Todas las categorias</option>
          <option value="plato">Platos</option>
          <option value="extra">Extras</option>
          <option value="refresco">Refrescos</option>
        </select>
      </div>

      {/* Cards en móvil, tabla en desktop */}
      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16 text-white/30">
          <Package size={40} strokeWidth={1} className="mx-auto mb-3" />
          <p>No se encontraron productos</p>
        </div>
      ) : (
        <>
          {/* Cards móvil */}
          <div className="sm:hidden flex flex-col gap-2">
            {filtered.map(product => (
              <div
                key={product.id}
                className={`card flex items-center gap-3 py-3 ${!product.is_active ? 'opacity-50' : ''}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-white text-sm">{product.name}</p>
                    <Badge variant={CATEGORY_VARIANTS[product.category]}>
                      {CATEGORY_LABELS[product.category]}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="font-bold text-white">Bs {Number(product.price).toFixed(2)}</span>
                    {product.chicken_pieces_required > 0 && (
                      <span className="text-xs text-brand-400">{product.chicken_pieces_required} 🍗</span>
                    )}
                    <Badge variant={product.is_active ? 'green' : 'gray'} className="ml-auto">
                      {product.is_active ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button
                    onClick={() => openEdit(product)}
                    className="p-2 rounded-xl bg-white/5 text-white/50 hover:text-white"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => toggleActive(product)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-medium ${
                      product.is_active
                        ? 'bg-red-500/10 text-red-400'
                        : 'bg-emerald-500/10 text-emerald-400'
                    }`}
                  >
                    {product.is_active ? 'Desact.' : 'Activar'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Tabla desktop */}
          <div className="hidden sm:block card p-0 overflow-hidden">
            <div className="table-container">
              <table className="table-base">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Categoria</th>
                    <th>Precio</th>
                    <th>Presas</th>
                    <th>Estado</th>
                    <th className="!text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(product => (
                    <tr key={product.id} className={!product.is_active ? 'opacity-50' : ''}>
                      <td>
                        <p className="font-medium text-white">{product.name}</p>
                        {product.description && (
                          <p className="text-xs text-white/40 mt-0.5">{product.description}</p>
                        )}
                      </td>
                      <td><Badge variant={CATEGORY_VARIANTS[product.category]}>{CATEGORY_LABELS[product.category]}</Badge></td>
                      <td className="font-semibold text-white">Bs {Number(product.price).toFixed(2)}</td>
                      <td>
                        {product.chicken_pieces_required > 0
                          ? <span className="text-brand-400">{product.chicken_pieces_required} 🍗</span>
                          : <span className="text-white/30">—</span>
                        }
                      </td>
                      <td><Badge variant={product.is_active ? 'green' : 'gray'}>{product.is_active ? 'Activo' : 'Inactivo'}</Badge></td>
                      <td>
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => openEdit(product)} className="p-1.5 rounded-lg hover:bg-white/8 text-white/40 hover:text-white transition-colors">
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => toggleActive(product)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                              product.is_active
                                ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                                : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                            }`}
                          >
                            {product.is_active ? 'Desactivar' : 'Activar'}
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

      {/* Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Producto' : 'Nuevo Producto'}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input id="prod-name" label="Nombre" placeholder="Ej: Economico" error={errors.name?.message} {...register('name')} />
          <div>
            <label className="text-xs font-medium text-white/60 uppercase tracking-wide block mb-1.5">Descripcion (opcional)</label>
            <textarea placeholder="Descripcion..." rows={2} className="input-base resize-none" {...register('description')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input id="prod-price" label="Precio (Bs)" type="number" step="0.01" min="0" error={errors.price?.message} {...register('price')} />
            <Input id="prod-pieces" label="Presas" type="number" min="0" error={errors.chicken_pieces_required?.message} {...register('chicken_pieces_required')} />
          </div>
          <Select id="prod-cat" label="Categoria" error={errors.category?.message} {...register('category')}>
            <option value="plato">Plato</option>
            <option value="extra">Extra</option>
            <option value="refresco">Refresco</option>
          </Select>
          {editing && (
            <label className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-400 border border-white/8 cursor-pointer">
              <input type="checkbox" className="accent-brand-500 w-4 h-4" {...register('is_active')} />
              <span className="text-sm text-white">Producto activo (visible en POS)</span>
            </label>
          )}
          <div className="flex gap-3 pt-1">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" variant="primary" className="flex-1" loading={saving}>
              {editing ? 'Guardar' : 'Crear'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
