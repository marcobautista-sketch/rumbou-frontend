import { useId, type ComponentProps } from 'react'
import { fieldStyles } from './fieldStyles'

interface TextAreaFieldProps extends ComponentProps<'textarea'> {
  label: string
  error?: string
  hint?: string
}

export function TextAreaField({
  label,
  error,
  hint,
  id,
  rows = 4,
  className = '',
  ...props
}: TextAreaFieldProps) {
  const generatedId = useId()
  const textAreaId = id ?? generatedId
  const message = error ?? hint
  const messageId = message ? `${textAreaId}-message` : undefined

  return (
    <div className={`space-y-1 ${className}`}>
      <label htmlFor={textAreaId} className="block text-sm font-medium">
        {label}
      </label>
      <textarea
        id={textAreaId}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={messageId}
        className={`${fieldStyles(Boolean(error))} resize-y`}
        {...props}
      />
      {message && (
        <p
          id={messageId}
          role={error ? 'alert' : undefined}
          className={`text-sm ${error ? 'text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'}`}
        >
          {message}
        </p>
      )}
    </div>
  )
}
