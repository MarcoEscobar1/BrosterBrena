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
import { Users, Plus, UserCheck, UserX, Search, Phone, Shield, User } from 'lucide-react'

const createSchema = z.object({
  first_name: z.string().min(1, 'El nombre es obligatorio').trim(),
  last_name:  z.string().min(1, 'El apellido es obligatorio').trim(),
  phone:      z.string().min(1, 'El celular es obligatorio').trim(),
  username:   z.string().min(3, 'Mínimo 3 caracteres').trim()
              .regex(/^[a-zA-Z0-9_]+$/, 'Solo letras, números y guiones bajos'),
  role:       z.enum(['admin', 'employee']),
  password:   z.string().min(6, 'Mínimo 6 caracteres'),
})

export default function Usuarios() {
  const [profiles,  setProfiles]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [saving,    setSaving]    = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(createSchema),
    defaultValues: { role: 'employee' },
  })

  const fetchProfiles = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('first_name')
    if (error) toast.error('Error cargando usuarios')
    else setProfiles(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchProfiles() }, [])

  const onSubmit = async (values) => {
    setSaving(true)
    try {
      const { data, error } = await supabase.functions.invoke('admin-create-user', {
        body: {
          first_name: values.first_name,
          last_name:  values.last_name,
          phone:      values.phone,
          username:   values.username,
          role:       values.role,
          password:   values.password,
        },
      })

      // FunctionsHttpError: el mensaje real está en el body de la respuesta
      if (error) {
        let msg = 'Error al crear usuario'
        try {
          // error.context es el Response object — extraer el JSON del body
          const body = await error.context?.json?.()
          msg = body?.error || error.message || msg
        } catch {
          msg = error.message || msg
        }
        throw new Error(msg)
      }

      if (data?.error) {
        throw new Error(data.error)
      }

      toast.success(`Usuario "${values.username}" creado exitosamente`)
      setModalOpen(false)
      reset()
      fetchProfiles()
    } catch (err) {
      toast.error(err.message || 'Error al crear usuario')
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (profile) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_active: !profile.is_active })
      .eq('id', profile.id)
    if (error) toast.error('Error al actualizar')
    else {
      toast.success(profile.is_active ? 'Usuario desactivado' : 'Usuario activado')
      fetchProfiles()
    }
  }

  const filtered = profiles.filter(p =>
    `${p.first_name} ${p.last_name} ${p.username} ${p.phone}`
      .toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center">
            <Users size={20} className="text-brand-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Usuarios del Sistema</h1>
            <p className="text-xs text-white/40">{profiles.length} usuarios registrados</p>
          </div>
        </div>
        <Button variant="primary" onClick={() => { reset({ role: 'employee' }); setModalOpen(true) }}>
          <Plus size={16} />
          Nuevo Usuario
        </Button>
      </div>

      {/* Búsqueda */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          placeholder="Buscar usuario..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-base pl-9"
        />
      </div>

      {/* Grid de usuarios */}
      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(p => (
            <div
              key={p.id}
              className={`card flex flex-col gap-3 ${!p.is_active ? 'opacity-60' : ''}`}
            >
              {/* Avatar + info */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-500/20 border border-brand-500/40 flex items-center justify-center shrink-0">
                  <span className="font-bold text-brand-400 text-sm">
                    {p.first_name[0]?.toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-white truncate">
                    {p.first_name} {p.last_name}
                  </p>
                  <p className="text-xs text-white/40 font-mono">@{p.username}</p>
                </div>
                <div className="ml-auto shrink-0">
                  <Badge variant={p.role === 'admin' ? 'orange' : 'purple'}>
                    {p.role === 'admin' ? <Shield size={10} /> : <User size={10} />}
                    {p.role}
                  </Badge>
                </div>
              </div>

              {/* Detalles */}
              <div className="flex items-center gap-2 text-xs text-white/40">
                <Phone size={12} />
                {p.phone ?? 'Sin teléfono'}
              </div>

              {/* Estado + acción */}
              <div className="flex items-center justify-between pt-1 border-t border-white/8">
                <Badge variant={p.is_active ? 'green' : 'gray'}>
                  {p.is_active ? <UserCheck size={10} /> : <UserX size={10} />}
                  {p.is_active ? 'Activo' : 'Inactivo'}
                </Badge>
                <button
                  onClick={() => toggleActive(p)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    p.is_active
                      ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                  }`}
                >
                  {p.is_active ? 'Desactivar' : 'Activar'}
                </button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-full text-center py-16 text-white/30">
              <Users size={40} strokeWidth={1} className="mx-auto mb-3" />
              <p>No se encontraron usuarios</p>
            </div>
          )}
        </div>
      )}

      {/* Modal Crear Usuario */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Crear Nuevo Usuario" size="md">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Input id="usr-fname" label="Nombre(s)" placeholder="Ej: María" error={errors.first_name?.message} {...register('first_name')} />
            <Input id="usr-lname" label="Apellido(s)" placeholder="Ej: López" error={errors.last_name?.message} {...register('last_name')} />
          </div>
          <Input id="usr-phone" label="Número de celular" placeholder="Ej: 77712345" error={errors.phone?.message} {...register('phone')} />
          <Input
            id="usr-username"
            label="Nombre de usuario"
            placeholder="Ej: maria_lopez"
            error={errors.username?.message}
            helper="Solo letras, números y guiones bajos. No puede repetirse."
            {...register('username')}
          />
          <Select id="usr-role" label="Rol" error={errors.role?.message} {...register('role')}>
            <option value="employee">Empleado</option>
            <option value="admin">Administrador</option>
          </Select>
          <Input
            id="usr-pass"
            label="Contraseña"
            type="password"
            placeholder="Mínimo 6 caracteres"
            error={errors.password?.message}
            {...register('password')}
          />

          {/* Advertencia */}
          <div className="bg-brand-500/10 border border-brand-500/30 rounded-xl px-4 py-3 text-xs text-brand-400">
            ⚠ El usuario podrá iniciar sesión inmediatamente con estas credenciales.
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" variant="primary" className="flex-1" loading={saving}>Crear Usuario</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
