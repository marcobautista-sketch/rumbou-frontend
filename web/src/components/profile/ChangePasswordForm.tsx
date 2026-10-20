import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { toApiError } from '../../api/apiError'
import { userService } from '../../api/userService'
import { newPasswordField } from '../../pages/auth/authSchemas'
import { notify } from '../../utils/notify'
import { Button } from '../ui/Button'
import { TextField } from '../ui/TextField'

const passwordSchema = z
  .object({
    contrasenaActual: z.string().min(1, 'Ingresa tu contraseña actual'),
    contrasenaNueva: newPasswordField,
    confirmPassword: z.string(),
  })
  .refine((form) => form.contrasenaNueva === form.confirmPassword, {
    error: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

type PasswordForm = z.infer<typeof passwordSchema>

export function ChangePasswordForm() {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    mode: 'onTouched',
    defaultValues: { contrasenaActual: '', contrasenaNueva: '', confirmPassword: '' },
  })

  const onSubmit = async ({ contrasenaActual, contrasenaNueva }: PasswordForm) => {
    try {
      await userService.changePassword(contrasenaActual, contrasenaNueva)
      notify.success('Tu contraseña cambió.')
      reset()
    } catch (error) {
      const apiError = toApiError(error)
      if (apiError.kind === 'validation') {
        setError('contrasenaActual', { message: 'La contraseña actual no es correcta' })
      } else {
        notify.error(apiError)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <TextField
        label="Contraseña actual"
        type="password"
        autoComplete="current-password"
        error={errors.contrasenaActual?.message}
        {...register('contrasenaActual')}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Contraseña nueva"
          type="password"
          autoComplete="new-password"
          hint="Mínimo 8 caracteres, con una mayúscula, una minúscula y un número."
          error={errors.contrasenaNueva?.message}
          {...register('contrasenaNueva')}
        />
        <TextField
          label="Repite la contraseña nueva"
          type="password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
      </div>
      <div className="flex justify-end">
        <Button type="submit" loading={isSubmitting}>
          Cambiar contraseña
        </Button>
      </div>
    </form>
  )
}
