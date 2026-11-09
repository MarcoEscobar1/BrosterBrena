let cleanupPreviousPrint

// Print an isolated copy so navigation, dialogs and action buttons never enter
// the print layout. Keep the copy until the browser finishes its print dialog.
export function printReceipt(receiptElement) {
  if (!receiptElement) return
  cleanupPreviousPrint?.()

  const root = document.createElement('div')
  root.id = 'receipt-print-root'
  const receipt = receiptElement.cloneNode(true)
  receipt.removeAttribute('id')
  root.append(receipt)
  document.body.append(root)
  document.body.classList.add('printing-receipt')

  const cleanup = () => {
    root.remove()
    document.body.classList.remove('printing-receipt')
    window.removeEventListener('afterprint', cleanup)
    cleanupPreviousPrint = undefined
  }
  cleanupPreviousPrint = cleanup
  window.addEventListener('afterprint', cleanup)

  try {
    window.print()
  } catch (error) {
    cleanup()
    throw error
  }
}
