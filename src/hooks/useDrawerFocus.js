import { useEffect, useRef } from 'react'

export function useDrawerFocus(open, onClose) {
  const ref = useRef(null)
  useEffect(() => {
    if (!open || window.matchMedia('(min-width: 1024px)').matches) return
    const panel = ref.current
    const previousFocus = document.activeElement
    const getControls = () => [...panel.querySelectorAll('button, a[href], input, select, textarea, [tabindex]')]
      .filter(el => !el.disabled && el.tabIndex >= 0 && el.getClientRects().length)
    const onKeyDown = event => {
      const activeDialog = [...document.querySelectorAll('[role="dialog"][aria-modal="true"]')].at(-1)
      if (activeDialog && activeDialog !== panel) return
      if (event.key === 'Escape') { event.preventDefault(); onClose(); return }
      if (event.key !== 'Tab') return
      const controls = getControls()
      const first = controls[0]
      const last = controls[controls.length - 1]
      if (!first) { event.preventDefault(); panel.focus(); return }
      if (!panel.contains(document.activeElement) || (event.shiftKey && document.activeElement === first)) {
        event.preventDefault(); (event.shiftKey ? last : first).focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus()
      }
    }
    panel.focus()
    document.addEventListener('keydown', onKeyDown)
    return () => { document.removeEventListener('keydown', onKeyDown); previousFocus?.focus() }
  }, [open, onClose])
  return ref
}
