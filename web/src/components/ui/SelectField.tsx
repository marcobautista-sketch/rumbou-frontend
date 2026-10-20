import { useId, type ComponentProps } from 'react'
import { fieldStyles } from './fieldStyles'

interface SelectFieldProps extends ComponentProps<'select'> {
  label: string
  error?: string
}

export function SelectField({
  label,
  error,
  id,
  className = '',
  children,
  ...props
}: SelectFieldProps) {
  const generatedId = useId()
  const selectId = id ?? generatedId
  const errorId = error ? `${selectId}-error` : undefined

  return (
    <div className={`space-y-1 ${className}`}>
      <label htmlFor={selectId} className="block text-sm font-medium">
        {label}
      </label>
      <select
        id={selectId}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
        className={fieldStyles(Boolean(error))}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p id={errorId} role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}
