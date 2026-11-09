import { forwardRef, useId } from 'react'

const Select = forwardRef(function Select(
  { label, error, className = '', id, children, ...props },
  ref
) {
  const generatedId = useId()
  const fieldId = id ?? generatedId
  const messageId = fieldId + '-message'
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={fieldId} className="text-xs font-medium text-muted normal-case tracking-normal">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={fieldId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? messageId : undefined}
        aria-label={label ? undefined : props['aria-label'] ?? props.placeholder}
        className={`input-base ${error ? 'input-error' : ''} ${className}`}

        {...props}
      >
        {children}
      </select>
      {error && (
        <p id={messageId} role="alert" className="text-xs text-danger flex items-center gap-1">
          {error}
        </p>
      )}
    </div>
  )
})

export default Select
