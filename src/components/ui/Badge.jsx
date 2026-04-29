/**
 * Badge reutilizable.
 * variant: 'orange' | 'green' | 'red' | 'yellow' | 'gray' | 'purple'
 */
export default function Badge({ children, variant = 'gray', className = '' }) {
  const cls = {
    orange: 'badge-orange',
    green:  'badge-green',
    red:    'badge-red',
    yellow: 'badge-yellow',
    gray:   'badge-gray',
    purple: 'badge-purple',
  }[variant] ?? 'badge-gray'

  return (
    <span className={`${cls} ${className}`}>
      {children}
    </span>
  )
}
