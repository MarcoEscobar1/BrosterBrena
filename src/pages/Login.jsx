import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '../context/AuthContext'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { Eye, EyeOff, Lock, User, Shield, Users } from 'lucide-react'

const schema = z.object({
  username: z.string().trim().min(1, 'El usuario es obligatorio'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
})

// Credenciales de demo para acceso rápido
const DEMO_CREDENTIALS = [
  {
    role: 'admin',
    label: 'Administrador',
    username: 'admin',
    password: 'admin123',
    icon: Shield,
    color: 'text-brand-400',
    bg: 'bg-brand-500/10 border-brand-500/30 hover:bg-brand-500/20',
    activeBg: 'bg-brand-500/25 border-brand-400',
    desc: 'Acceso completo al sistema',
  },
  {
    role: 'employee',
    label: 'Empleado',
    username: 'empleado',
    password: 'empleado123',
    icon: Users,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10 border-purple-500/30 hover:bg-purple-500/20',
    activeBg: 'bg-purple-500/25 border-purple-400',
    desc: 'POS, ventas e inventario',
  },
]

export default function Login() {
  const { loginWithUsername } = useAuth()
  const navigate = useNavigate()
  const [showPass,    setShowPass]    = useState(false)
  const [authError,   setAuthError]   = useState('')
  const [selectedRole, setSelectedRole] = useState(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) })

  // Autocompletar con credenciales de demo
  const handleSelectDemo = (demo) => {
    setSelectedRole(demo.role)
    setAuthError('')
    setValue('username', demo.username)
    setValue('password', demo.password)
  }

  const onSubmit = async ({ username, password }) => {
    setAuthError('')
    const { data, error } = await loginWithUsername(username, password)
    if (error) {
      setAuthError('Usuario o contraseña incorrectos')
      return
    }
    const role = data?.user?.role
    if (role === 'admin') {
      navigate('/admin/dashboard', { replace: true })
    } else {
      navigate('/pos', { replace: true })
    }
  }

  return (
    <div className="min-h-screen min-h-dvh bg-surface-300 flex items-center justify-center p-4">
      <div className="w-full max-w-sm animate-slide-up relative">
        {/* Card */}
        <div className="bg-surface-50 border border-white/10 rounded-2xl p-5 sm:p-8 shadow-2xl">
          {/* Logo + nombre */}
          <div className="flex flex-col items-center gap-3 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-brand-500/15 border border-brand-500/40 flex items-center justify-center overflow-hidden">
              <img
                src="/Logo.jpg"
                alt="Broastería Brena"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.parentElement.innerHTML = '<span style="font-size:1.5rem;font-weight:800;color:#fb923c;">BB</span>'
                }}
              />
            </div>
            <div className="text-center">
              <h1 className="text-xl font-bold text-white">Broastería Brena</h1>
              <p className="text-xs text-white/60 mt-0.5">Sistema de Gestión</p>
            </div>
          </div>

          {/* Selector de rol (acceso rápido) */}
          <div className="mb-5">
            <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2.5">
              Acceso rápido
            </p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_CREDENTIALS.map(demo => {
                const Icon = demo.icon
                const isActive = selectedRole === demo.role
                return (
                  <button
                    aria-pressed={isActive}
                    key={demo.role}
                    type="button"
                    onClick={() => handleSelectDemo(demo)}
                    className={`
                      flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all duration-150 text-left
                      ${isActive ? demo.activeBg : demo.bg}
                    `}
                  >
                    <Icon size={18} className={demo.color} />
                    <span className={`text-xs font-bold ${demo.color}`}>{demo.label}</span>
                    <span className="text-[10px] text-white/60 text-center leading-tight">{demo.desc}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Separador */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-[10px] text-white/60 uppercase tracking-wider">o inicia sesión</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
            {/* Usuario */}
            <div className="relative">
              <div className="absolute left-3.5 top-[23px] -translate-y-1/2 text-white/60 pointer-events-none z-10">
                <User size={16} />
              </div>
              <Input
                aria-label="Nombre de usuario"
                id="username"
                placeholder="Nombre de usuario"
                autoComplete="username"
                error={errors.username?.message}
                className="pl-10"
                {...register('username')}
              />
            </div>

            {/* Contraseña */}
            <div className="relative">
              <div className="absolute left-3.5 top-[23px] -translate-y-1/2 text-white/60 pointer-events-none z-10">
                <Lock size={16} />
              </div>
              <Input
                aria-label="Contraseña"
                id="password"
                type={showPass ? 'text' : 'password'}
                placeholder="Contraseña"
                autoComplete="current-password"
                error={errors.password?.message}
                className="pl-10 pr-10"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPass(p => !p)}
                className="absolute right-3 top-[23px] -translate-y-1/2 text-white/60 hover:text-white/60 transition-colors"
                aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                aria-pressed={showPass}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Error de auth */}
            {authError && (
              <div role="alert" className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-400 text-center animate-fade-in">
                {authError}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isSubmitting}
              disabled={isSubmitting}
              className="w-full mt-1"
            >
              {isSubmitting ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </Button>
          </form>

        </div>
      </div>
    </div>
  )
}
