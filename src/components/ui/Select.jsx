import { forwardRef } from 'react'

const Select = forwardRef(function Select(
  { label, error, className = '', id, children, ...props },
  ref
) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-xs font-medium text-white/60 uppercase tracking-wide">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={id}
        className={`input-base ${error ? 'input-error' : ''} ${className}`}
        style={{ colorScheme: 'dark' }}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  )
})

export default Select
