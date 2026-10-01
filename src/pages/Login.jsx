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
  username: z.string().min(1, 'El usuario es obligatorio').trim(),
  password: z.string().min(1, 'La contrasena es obligatoria'),
})

// Credenciales de demo para acceso rapido
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
      setAuthError('Usuario o contrasena incorrectos')
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
    <div className="min-h-screen bg-surface-300 flex items-center justify-center p-4">
      {/* Glow de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500/8 rounded-full blur-3xl" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm animate-slide-up relative">
        {/* Card */}
        <div className="bg-surface-50 border border-white/10 rounded-2xl p-8 shadow-2xl">
          {/* Logo + nombre */}
          <div className="flex flex-col items-center gap-3 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-brand-500/15 border border-brand-500/40 flex items-center justify-center overflow-hidden">
              <img
                src="/Logo.jpg"
                alt="Broasteria Brena"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.parentElement.innerHTML = '<span style="font-size:1.5rem;font-weight:800;color:#fb923c;">BB</span>'
                }}
              />
            </div>
            <div className="text-center">
              <h1 className="text-xl font-bold text-white">Broasteria Brena</h1>
              <p className="text-xs text-white/40 mt-0.5">Sistema de Gestion</p>
            </div>
          </div>

          {/* Selector de rol (acceso rapido) */}
          <div className="mb-5">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2.5">
              Acceso rapido
            </p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_CREDENTIALS.map(demo => {
                const Icon = demo.icon
                const isActive = selectedRole === demo.role
                return (
                  <button
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
                    <span className="text-[10px] text-white/40 text-center leading-tight">{demo.desc}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Separador */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-[10px] text-white/30 uppercase tracking-wider">o inicia sesion</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
            {/* Usuario */}
            <div className="relative">
              <div className="absolute left-3.5 top-[23px] -translate-y-1/2 text-white/30 pointer-events-none z-10">
                <User size={16} />
              </div>
              <Input
                id="username"
                placeholder="Nombre de usuario"
                autoComplete="username"
                autoFocus
                error={errors.username?.message}
                className="pl-10"
                {...register('username')}
              />
            </div>

            {/* Contrasena */}
            <div className="relative">
              <div className="absolute left-3.5 top-[23px] -translate-y-1/2 text-white/30 pointer-events-none z-10">
                <Lock size={16} />
              </div>
              <Input
                id="password"
                type={showPass ? 'text' : 'password'}
                placeholder="Contrasena"
                autoComplete="current-password"
                error={errors.password?.message}
                className="pl-10 pr-10"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPass(p => !p)}
                className="absolute right-3 top-[23px] -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                tabIndex={-1}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Error de auth */}
            {authError && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-400 text-center animate-fade-in">
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
              {isSubmitting ? 'Iniciando sesion...' : 'Iniciar Sesion'}
            </Button>
          </form>

          {/* Credenciales de demo */}
          <div className="mt-5 pt-4 border-t border-white/8">
            <p className="text-[10px] text-white/25 text-center uppercase tracking-wider mb-2">Demo</p>
            <div className="flex flex-col gap-1">
              {DEMO_CREDENTIALS.map(d => (
                <div key={d.role} className="flex items-center justify-between text-[10px] text-white/30">
                  <span className={d.color + ' font-medium'}>{d.label}:</span>
                  <span className="font-mono">{d.username} / {d.password}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
