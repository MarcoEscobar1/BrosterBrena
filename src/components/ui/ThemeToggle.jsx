import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const dark = theme === 'dark'
  return (
    <button type="button" onClick={toggleTheme} className="theme-toggle"
      aria-label="Modo oscuro" aria-pressed={dark}
      title={dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}>
      {dark ? <Moon size={18} aria-hidden="true" /> : <Sun size={18} aria-hidden="true" />}
      <span className="hidden sm:inline">{dark ? 'Modo oscuro' : 'Modo claro'}</span>
    </button>
  )
}
