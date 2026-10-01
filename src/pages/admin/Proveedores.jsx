import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { db } from '../../lib/mockDb'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Spinner from '../../components/ui/Spinner'
import Badge from '../../components/ui/Badge'
import toast from 'react-hot-toast'
import { Truck, Plus, Pencil, History, Search, Phone } from 'lucide-react'

const schema = z.object({
  first_name:  z.string().min(1, 'El nombre es obligatorio').trim(),
  last_name:   z.string().min(1, 'El apellido es obligatorio').trim(),
  phone:       z.string().min(1, 'El celular es obligatorio').trim(),
  description: z.string().optional(),
})

export default function Proveedores() {
  const navigate = useNavigate()
  const [suppliers, setSuppliers] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing,   setEditing]   = useState(null)
  const [saving,    setSaving]    = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })

  const fetchSuppliers = () => {
    setLoading(true)
    setSuppliers(db.getSuppliers())
    setLoading(false)
  }

  useEffect(() => { fetchSuppliers() }, [])

  const openCreate = () => {
    setEditing(null)
    reset({ first_name: '', last_name: '', phone: '', description: '' })
    setModalOpen(true)
  }

  const openEdit = (s) => {
    setEditing(s)
    reset({ first_name: s.first_name, last_name: s.last_name, phone: s.phone, description: s.description ?? '' })
    setModalOpen(true)
  }

  const onSubmit = async (values) => {
    setSaving(true)
    try {
      if (editing) {
        const result = db.updateSupplier(editing.id, values)
        if (result.error) throw new Error(result.error)
        toast.success('Proveedor actualizado')
      } else {
        const result = db.createSupplier(values)
        if (result.error) throw new Error(result.error)
        toast.success('Proveedor creado')
      }
      setModalOpen(false)
      fetchSuppliers()
    } catch (err) {
      toast.error(err.message || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = (s) => {
    const result = db.toggleSupplierActive(s.id)
    if (result.error) {
      toast.error('Error al actualizar')
    } else {
      toast.success(s.is_active ? 'Proveedor desactivado' : 'Proveedor activado')
      fetchSuppliers()
    }
  }

  const filtered = suppliers.filter(s =>
    `${s.first_name} ${s.last_name} ${s.phone}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center">
            <Truck size={20} className="text-brand-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Proveedores</h1>
            <p className="text-xs text-white/40">{suppliers.length} proveedores registrados</p>
          </div>
        </div>
        <Button variant="primary" onClick={openCreate}>
          <Plus size={16} />
          Nuevo Proveedor
        </Button>
      </div>

      {/* Busqueda */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          placeholder="Buscar proveedor..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-base pl-9"
        />
      </div>

      {/* Tabla */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-white/30">
            <Truck size={40} strokeWidth={1} className="mx-auto mb-3" />
            <p>No se encontraron proveedores</p>
          </div>
        ) : (
          <table className="table-base">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Telefono</th>
                <th>Descripcion</th>
                <th>Estado</th>
                <th className="!text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id} className={!s.is_active ? 'opacity-50' : ''}>
                  <td>
                    <p className="font-medium text-white">{s.first_name} {s.last_name}</p>
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5 text-white/60">
                      <Phone size={13} />
                      {s.phone}
                    </div>
                  </td>
                  <td className="text-white/50 text-xs max-w-xs truncate">
                    {s.description ?? '-'}
                  </td>
                  <td>
                    <Badge variant={s.is_active ? 'green' : 'gray'}>
                      {s.is_active ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </td>
                  <td>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => navigate(`/admin/proveedores/${s.id}/compras`)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                        title="Historial de compras"
                      >
                        <History size={13} />
                        Compras
                      </button>
                      <button
                        onClick={() => openEdit(s)}
                        className="p-1.5 rounded-lg hover:bg-white/8 text-white/40 hover:text-white transition-colors"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => toggleActive(s)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                          s.is_active
                            ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                        }`}
                      >
                        {s.is_active ? 'Desactivar' : 'Activar'}
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
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Proveedor' : 'Nuevo Proveedor'}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Input id="sup-fname" label="Nombre(s)" placeholder="Ej: Carlos" error={errors.first_name?.message} {...register('first_name')} />
            <Input id="sup-lname" label="Apellido(s)" placeholder="Ej: Mamani" error={errors.last_name?.message} {...register('last_name')} />
          </div>
          <Input id="sup-phone" label="Numero de celular" placeholder="Ej: 77712345" error={errors.phone?.message} {...register('phone')} />
          <div>
            <label className="text-xs font-medium text-white/60 uppercase tracking-wide block mb-1.5">Descripcion (que nos provee)</label>
            <textarea rows={2} placeholder="Ej: Pollos frescos del mercado central..." className="input-base resize-none" {...register('description')} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" variant="primary" className="flex-1" loading={saving}>
              {editing ? 'Guardar Cambios' : 'Crear Proveedor'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
