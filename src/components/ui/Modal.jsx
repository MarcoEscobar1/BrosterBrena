import { useEffect, useCallback } from 'react'
import { X } from 'lucide-react'

/**
 * Modal reutilizable.
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
  const boxClass = {
    sm: 'modal-box max-w-sm',
    md: 'modal-box',
    lg: 'modal-box-lg',
    xl: 'modal-box-xl',
  }[size] ?? 'modal-box'

  // Cerrar con Escape
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
      className="modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget && !hideClose) onClose?.() }}
    >
      <div className={boxClass} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        {(title || !hideClose) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
            {title && (
              <h2 className="text-base font-semibold text-white">{title}</h2>
            )}
            {!hideClose && (
              <button
                onClick={onClose}
                className="ml-auto p-1.5 rounded-lg hover:bg-white/8 text-white/40 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  )
}
