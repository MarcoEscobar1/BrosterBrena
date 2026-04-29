import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '../../lib/supabaseClient'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import toast from 'react-hot-toast'
import { Plus, Pencil, Package, Search } from 'lucide-react'

const productSchema = z.object({
  name:                    z.string().min(1, 'El nombre es obligatorio').trim(),
  description:             z.string().optional(),
  price:                   z.coerce.number().min(0.01, 'El precio debe ser mayor a 0'),
  category:                z.enum(['plato', 'refresco', 'extra'], { required_error: 'Selecciona una categoría' }),
  chicken_pieces_required: z.coerce.number().int().min(0, 'No puede ser negativo'),
  is_active:               z.boolean().optional(),
})

const CATEGORY_LABELS = { plato: 'Plato', refresco: 'Refresco', extra: 'Extra' }
const CATEGORY_VARIANTS = { plato: 'orange', refresco: 'purple', extra: 'yellow' }

export default function Productos() {
  const [products,   setProducts]   = useState([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [filterCat,  setFilterCat]  = useState('all')
  const [modalOpen,  setModalOpen]  = useState(false)
  const [editing,    setEditing]    = useState(null) // producto siendo editado
  const [saving,     setSaving]     = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: { is_active: true, chicken_pieces_required: 0 },
  })

  const fetchProducts = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('category')
      .order('name')
    if (error) toast.error('Error cargando productos')
    else setProducts(data ?? [])
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
        const { error } = await supabase
          .from('products')
          .update(values)
          .eq('id', editing.id)
        if (error) throw error
        toast.success('Producto actualizado')
      } else {
        const { error } = await supabase
          .from('products')
          .insert(values)
        if (error) throw error
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

  const toggleActive = async (product) => {
    const { error } = await supabase
      .from('products')
      .update({ is_active: !product.is_active })
      .eq('id', product.id)
    if (error) toast.error('Error al actualizar')
    else {
      toast.success(product.is_active ? 'Producto desactivado' : 'Producto activado')
      fetchProducts()
    }
  }

  // Filtros
  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchCat    = filterCat === 'all' || p.category === filterCat
    return matchSearch && matchCat
  })

  return (
    <div className="p-6 flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center">
            <Package size={20} className="text-brand-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Productos</h1>
            <p className="text-xs text-white/40">{products.length} productos registrados</p>
          </div>
        </div>
        <Button variant="primary" onClick={openCreate}>
          <Plus size={16} />
          Nuevo Producto
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
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
          className="input-base w-40"
          style={{ colorScheme: 'dark' }}
        >
          <option value="all">Todas las categorías</option>
          <option value="plato">Platos</option>
          <option value="extra">Extras</option>
          <option value="refresco">Refrescos</option>
        </select>
      </div>

      {/* Tabla */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-white/30">
            <Package size={40} strokeWidth={1} className="mx-auto mb-3" />
            <p>No se encontraron productos</p>
          </div>
        ) : (
          <table className="table-base">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Categoría</th>
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
                  <td>
                    <Badge variant={CATEGORY_VARIANTS[product.category]}>
                      {CATEGORY_LABELS[product.category]}
                    </Badge>
                  </td>
                  <td className="font-semibold text-white">
                    Bs {Number(product.price).toFixed(2)}
                  </td>
                  <td>
                    {product.chicken_pieces_required > 0
                      ? <span className="text-brand-400">{product.chicken_pieces_required} 🍗</span>
                      : <span className="text-white/30">—</span>
                    }
                  </td>
                  <td>
                    <Badge variant={product.is_active ? 'green' : 'gray'}>
                      {product.is_active ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </td>
                  <td>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openEdit(product)}
                        className="p-1.5 rounded-lg hover:bg-white/8 text-white/40 hover:text-white transition-colors"
                        title="Editar"
                      >
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
        )}
      </div>

      {/* Modal Crear/Editar */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Editar Producto' : 'Nuevo Producto'}
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            id="prod-name"
            label="Nombre"
            placeholder="Ej: Económico"
            error={errors.name?.message}
            {...register('name')}
          />
          <div>
            <label className="text-xs font-medium text-white/60 uppercase tracking-wide block mb-1.5">
              Descripción (opcional)
            </label>
            <textarea
              placeholder="Descripción del producto..."
              rows={2}
              className="input-base resize-none"
              {...register('description')}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              id="prod-price"
              label="Precio (Bs)"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              error={errors.price?.message}
              {...register('price')}
            />
            <Input
              id="prod-pieces"
              label="Presas de pollo"
              type="number"
              min="0"
              placeholder="0"
              error={errors.chicken_pieces_required?.message}
              {...register('chicken_pieces_required')}
            />
          </div>
          <Select
            id="prod-category"
            label="Categoría"
            error={errors.category?.message}
            {...register('category')}
          >
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
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" className="flex-1" loading={saving}>
              {editing ? 'Guardar Cambios' : 'Crear Producto'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
