import { useEffect, useRef, useId } from 'react'
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
  const dialogRef = useRef(null)
  const closeRef = useRef(onClose)
  useEffect(() => { closeRef.current = onClose }, [onClose])
  const titleId = useId()
  const maxWClass = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-lg',
    lg: 'sm:max-w-2xl',
    xl: 'sm:max-w-4xl',
  }[size] ?? 'sm:max-w-lg'

  useEffect(() => {
    if (!open) return
    const previousFocus = document.activeElement
    const previousOverflow = document.body.style.overflow
    const dialog = dialogRef.current
    const getFocusable = () => [...dialog.querySelectorAll('button, input, select, textarea, a[href], [tabindex]')]
      .filter(el => !el.disabled && el.tabIndex >= 0 && el.getClientRects().length)
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !hideClose) { event.stopPropagation(); closeRef.current?.() }
      if (event.key === 'Tab') {
        const nodes = getFocusable()
        const first = nodes[0]
        const last = nodes[nodes.length - 1]
        if (!first) { event.preventDefault(); dialog.focus(); return }
        if (!dialog.contains(document.activeElement) || (event.shiftKey && document.activeElement === first)) {
          event.preventDefault(); (event.shiftKey ? last : first).focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault(); first.focus()
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    dialog.focus()
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      previousFocus?.focus()
    }
  }, [open, hideClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 animate-fade-in"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget && !hideClose) onClose?.() }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : 'Diálogo'}
        tabIndex={-1}
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
              <h2 id={titleId} className="text-base font-semibold text-white">{title}</h2>
            )}
            {!hideClose && (
              <button
                aria-label="Cerrar diálogo"
                onClick={onClose}
                className="ml-auto p-2 rounded-xl hover:bg-white/8 text-white/60 hover:text-white transition-colors"
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
