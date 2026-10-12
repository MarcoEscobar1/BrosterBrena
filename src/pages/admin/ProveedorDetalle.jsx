import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { db } from '../../lib/mockDb'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import toast from 'react-hot-toast'
import { ArrowLeft } from 'lucide-react'

const schema = z.object({
  first_name: z.string().trim().min(1, 'El nombre es obligatorio'),
  last_name: z.string().trim().min(1, 'El apellido es obligatorio'),
  phone: z.string().trim().min(1, 'El celular es obligatorio'),
  description: z.string().optional(),
})

export default function ProveedorDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [supplier] = useState(() => id ? db.getSupplierById(id) : null)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: supplier ?? { first_name: '', last_name: '', phone: '', description: '' },
  })
  const goBack = () => navigate('/admin/proveedores')
  const onSubmit = values => {
    try {
      const result = id ? db.updateSupplier(id, values) : db.createSupplier(values)
      if (result.error) throw new Error(result.error)
      toast.success(id ? 'Proveedor actualizado' : 'Proveedor creado')
      goBack()
    } catch (error) { toast.error(error.message || 'No se pudo guardar. Intenta de nuevo.') }
  }
  if (id && !supplier) return (
    <div className="p-4 sm:p-6 text-center">
      <h1 className="text-xl font-semibold">Proveedor no encontrado</h1>
      <Button className="mt-4" variant="secondary" onClick={goBack}>Volver a proveedores</Button>
    </div>
  )
  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      <Button variant="ghost" onClick={goBack} className="mb-4"><ArrowLeft size={18} />Proveedores</Button>
      <h1 className="text-xl font-bold mb-6">{id ? 'Editar proveedor' : 'Nuevo proveedor'}</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Nombre(s)" error={errors.first_name?.message} {...register('first_name')} />
          <Input label="Apellido(s)" error={errors.last_name?.message} {...register('last_name')} />
        </div>
        <Input label="Número de celular" type="tel" error={errors.phone?.message} {...register('phone')} />
        <div>
          <label htmlFor="supplier-description" className="block text-xs text-white/60 mb-2">Descripción (qué nos provee)</label>
          <textarea id="supplier-description" rows={3} className="input-base" {...register('description')} />
        </div>
        <div className="flex flex-wrap gap-3 mt-2">
          <Button variant="secondary" onClick={goBack}>Cancelar</Button>
          <Button type="submit" loading={isSubmitting}>{id ? 'Guardar cambios' : 'Crear proveedor'}</Button>
        </div>
      </form>
    </div>
  )
}
