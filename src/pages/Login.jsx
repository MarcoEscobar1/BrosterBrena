import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '../context/AuthContext'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { Eye, EyeOff, Lock, User } from 'lucide-react'

const schema = z.object({
  username: z.string().min(1, 'El usuario es obligatorio').trim(),
  password: z.string().min(1, 'La contraseña es obligatoria'),
})

export default function Login() {
  const { loginWithUsername } = useAuth()
  const navigate = useNavigate()
  const [showPass, setShowPass] = useState(false)
  const [authError, setAuthError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async ({ username, password }) => {
    setAuthError('')
    const { data, error } = await loginWithUsername(username, password)
    if (error) {
      setAuthError('Usuario o contraseña incorrectos')
      return
    }
    // La redirección la maneja AuthContext + RedirectIfAuth
    const role = data?.user?.user_metadata?.role
    // Pequeño delay para que el profile cargue
    setTimeout(() => {
      navigate('/', { replace: true })
    }, 100)
  }

  return (
    <div className="min-h-screen bg-surface-300 flex items-center justify-center p-4">
      {/* Glow de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500/8 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm animate-slide-up relative">
        {/* Card */}
        <div className="bg-surface-50 border border-white/10 rounded-2xl p-8 shadow-2xl">
          {/* Logo + nombre */}
          <div className="flex flex-col items-center gap-3 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-brand-500/15 border border-brand-500/40 flex items-center justify-center overflow-hidden">
              <img
                src="/Logo.jpg"
                alt="Broastería Brena"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.parentElement.innerHTML = `
                    <span style="font-size:1.5rem;font-weight:800;color:#fb923c;">BB</span>
                  `
                }}
              />
            </div>
            <div className="text-center">
              <h1 className="text-xl font-bold text-white">Broastería Brena</h1>
            </div>
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

            {/* Contraseña */}
            <div className="relative">
              <div className="absolute left-3.5 top-[23px] -translate-y-1/2 text-white/30 pointer-events-none z-10">
                <Lock size={16} />
              </div>
              <Input
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
              className="w-full mt-2"
            >
              {isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
