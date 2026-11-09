import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '../context/AuthContext'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import ThemeToggle from '../components/ui/ThemeToggle'
import { Eye, EyeOff } from 'lucide-react'
const schema=z.object({username:z.string().trim().min(1,'Escribe tu nombre de usuario'),password:z.string().min(1,'Escribe tu contraseña')})
export default function Login() {
  const {loginWithUsername}=useAuth()
  const navigate=useNavigate()
  const [visible,setVisible]=useState(false)
  const [authError,setAuthError]=useState('')
  const {register,handleSubmit,reset,setFocus,formState:{errors,isSubmitting}}=useForm({resolver:zodResolver(schema)})
  const onSubmit=async({username,password})=>{
    setAuthError('')
    const {data,error}=await loginWithUsername(username,password)
    if(error){setAuthError('El usuario o la contraseña no coinciden. Revisa tus datos e inténtalo de nuevo.');setFocus('username');return}
    navigate(data?.user?.role==='admin'?'/admin/dashboard':'/pos',{replace:true})
  }
  const fillDemo = (username, password) => {
    reset({ username, password })
    setAuthError('')
    setFocus('username')
  }
  return <main className="login-shell">
    <div className="login-theme"><ThemeToggle /></div>
    <section className="login-form" aria-labelledby="login-title">
      <div className="login-identity">
        <img src="/Logo.jpg" alt="Broastería Brena" width="88" height="88" className="login-logo" />
        <h1 id="login-title" className="font-bold">Iniciar sesión</h1>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <Input label="Usuario" id="username" placeholder="Tu nombre de usuario…" autoComplete="username" spellCheck={false} autoCapitalize="none" error={errors.username?.message} {...register('username')}/>
        <div className="relative"><Input label="Contraseña" id="password" type={visible?'text':'password'} autoComplete="current-password" placeholder="Tu contraseña…" className="pr-12" error={errors.password?.message} {...register('password')}/><button type="button" onClick={()=>setVisible(v=>!v)} aria-label={visible?'Ocultar contraseña':'Mostrar contraseña'} aria-pressed={visible} className="absolute right-1 top-6 p-3 text-muted rounded-lg hover:bg-surface-400">{visible?<EyeOff size={18}/>:<Eye aria-hidden="true" size={18}/>}</button></div>
        {authError && <p role="alert" className="text-sm text-danger bg-danger-soft rounded-lg p-3">{authError}</p>}
        <Button type="submit" loading={isSubmitting} className="w-full" size="lg">{isSubmitting?'Iniciando sesión…':'Iniciar sesión'}</Button>
      </form>
      <div className="login-demo">
        <h2 className="text-sm font-semibold">Cuentas de prueba</h2>
        <p className="text-xs text-muted mt-1 mb-3">Selecciona una cuenta para completar el formulario.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button type="button" className="demo-account" onClick={()=>fillDemo('admin','admin123')}>
            <span className="font-semibold">Administrador</span>
            <span className="text-xs text-muted">admin / admin123</span>
          </button>
          <button type="button" className="demo-account" onClick={()=>fillDemo('empleado','empleado123')}>
            <span className="font-semibold">Empleado</span>
            <span className="text-xs text-muted">empleado / empleado123</span>
          </button>
        </div>
      </div>
    </section>
  </main>
}
