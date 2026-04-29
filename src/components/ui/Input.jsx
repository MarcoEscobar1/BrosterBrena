import { forwardRef } from 'react'

/**
 * Input reutilizable con soporte para label, error y helper text.
 */
const Input = forwardRef(function Input(
  { label, error, helper, className = '', id, ...props },
  ref
) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-xs font-medium text-white/60 uppercase tracking-wide">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={`input-base ${error ? 'input-error' : ''} ${className}`}
        {...props}
      />
      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
      {!error && helper && (
        <p className="text-xs text-white/30">{helper}</p>
      )}
    </div>
  )
})

export default Input
