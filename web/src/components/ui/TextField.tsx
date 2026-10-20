import { Eye, EyeOff } from 'lucide-react'
import { useId, useState, type ComponentProps } from 'react'

interface TextFieldProps extends ComponentProps<'input'> {
  label: string
  error?: string
  hint?: string
}

export function TextField({
  label,
  error,
  hint,
  type = 'text',
  id,
  className = '',
  ...props
}: TextFieldProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const [passwordVisible, setPasswordVisible] = useState(false)
  const isPassword = type === 'password'
  const message = error ?? hint
  const messageId = message ? `${inputId}-message` : undefined

  return (
    <div className={`space-y-1 ${className}`}>
      <label htmlFor={inputId} className="block text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          type={isPassword && passwordVisible ? 'text' : type}
          aria-invalid={error ? true : undefined}
          aria-describedby={messageId}
          className={`w-full rounded-lg border bg-white px-3 py-2 transition outline-none focus:ring-2 dark:bg-slate-900 ${
            error
              ? 'border-red-500 focus:ring-red-200 dark:focus:ring-red-900'
              : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-200 dark:border-slate-700 dark:focus:ring-indigo-900'
          } ${isPassword ? 'pr-10' : ''}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setPasswordVisible((visible) => !visible)}
            aria-label={passwordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          >
            {passwordVisible ? (
              <EyeOff aria-hidden className="size-4" />
            ) : (
              <Eye aria-hidden className="size-4" />
            )}
          </button>
        )}
      </div>
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
