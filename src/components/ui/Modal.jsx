import { useEffect, useRef, useId } from 'react'
import { X } from 'lucide-react'
import { createPortal } from 'react-dom'

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

  return createPortal(<div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 "
      style={{ background: 'rgba(32,37,44,0.42)' }}
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
          bg-surface-50 w-full ${maxWClass}
          rounded-t-2xl sm:rounded-2xl shadow-2xl
          max-h-[92dvh] overflow-y-auto
          pb-safe
        `}

        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle (solo móvil) */}
        {!hideClose && (
          <div className="sm:hidden flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-ink/5" />
          </div>
        )}

        {/* Header */}
        {(title || !hideClose) && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-line sticky top-0 bg-surface-50 z-10">
            {title && (
              <h2 id={titleId} className="text-base font-semibold text-ink">{title}</h2>
            )}
            {!hideClose && (
              <button
                aria-label="Cerrar diálogo"
                onClick={onClose}
                className="ml-auto p-2 rounded-xl hover:bg-ink/5 text-muted hover:text-ink transition-colors"
              >
                <X aria-hidden="true" size={18} />
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
  , document.body)
}
