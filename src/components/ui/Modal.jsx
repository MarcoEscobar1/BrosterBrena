import { useEffect, useCallback } from 'react'
import { X } from 'lucide-react'

/**
 * Modal reutilizable.
 * En móvil se presenta como bottom-sheet.
 * size: 'sm' | 'md' | 'lg' | 'xl'
 */
export default function Modal({
  open,
  onClose,
  title,
  children,
  size      = 'md',
  hideClose = false,
}) {
  const maxWClass = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-lg',
    lg: 'sm:max-w-2xl',
    xl: 'sm:max-w-4xl',
  }[size] ?? 'sm:max-w-lg'

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape' && !hideClose) onClose?.()
  }, [onClose, hideClose])

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, handleKeyDown])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 animate-fade-in"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget && !hideClose) onClose?.() }}
    >
      <div
        className={`
          bg-surface-50 w-full ${maxWClass} animate-slide-up
          rounded-t-2xl sm:rounded-2xl shadow-2xl
          max-h-[92dvh] overflow-y-auto
          pb-safe
        `}
        style={{ border: '1px solid rgba(255,255,255,0.12)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle (solo móvil) */}
        {!hideClose && (
          <div className="sm:hidden flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-white/20" />
          </div>
        )}

        {/* Header */}
        {(title || !hideClose) && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/8 sticky top-0 bg-surface-50 z-10">
            {title && (
              <h2 className="text-base font-semibold text-white">{title}</h2>
            )}
            {!hideClose && (
              <button
                onClick={onClose}
                className="ml-auto p-2 rounded-xl hover:bg-white/8 text-white/40 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="p-5">
          {children}
        </div>
      </div>
    </div>
  )
}
