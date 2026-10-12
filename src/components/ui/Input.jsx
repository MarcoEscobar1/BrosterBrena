import { forwardRef, useId } from 'react'

/**
 * Input reutilizable con soporte para label, error y helper text.
 */
const Input = forwardRef(function Input(
  { label, error, helper, className = '', id, ...props },
  ref
) {
  const generatedId = useId()
  const fieldId = id ?? generatedId
  const messageId = fieldId + '-message'
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={fieldId} className="text-xs font-medium text-white/60 uppercase tracking-wide">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={fieldId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || helper ? messageId : undefined}
        aria-label={label ? undefined : props['aria-label'] ?? props.placeholder}
        className={`input-base ${error ? 'input-error' : ''} ${className}`}
        {...props}
      />
      {error && (
        <p id={messageId} role="alert" className="text-xs text-red-400 flex items-center gap-1">
          {error}
        </p>
      )}
      {!error && helper && (
        <p id={messageId} className="text-xs text-white/60">{helper}</p>
      )}
    </div>
  )
})

export default Input
