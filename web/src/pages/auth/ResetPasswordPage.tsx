import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { ApiError, toApiError } from '../../api/apiError'
import { authService } from '../../api/authService'
import { AuthLayout } from '../../components/auth/AuthLayout'
import { Button } from '../../components/ui/Button'
import { TextField } from '../../components/ui/TextField'
import { paths } from '../../routes/paths'
import { notify } from '../../utils/notify'
import { resetPasswordSchema, type ResetPasswordForm } from './authSchemas'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordForm>({ resolver: zodResolver(resetPasswordSchema), mode: 'onTouched' })

  const onSubmit = async ({ newPassword }: ResetPasswordForm) => {
    if (!token) return
    try {
      await authService.resetPassword({ token, newPassword })
      notify.success('Listo, tu contraseña cambió. Ya puedes iniciar sesión.')
      navigate(paths.login, { replace: true })
    } catch (error) {
      const { kind } = toApiError(error)
      const linkExpired = kind === 'unauthorized' || kind === 'validation'
      notify.error(
        linkExpired
          ? new ApiError('validation', 'El enlace venció o ya se usó. Pide uno nuevo.')
          : error,
      )
    }
  }

  return (
    <AuthLayout
      title="Crea una contraseña nueva"
      subtitle="Elige una contraseña que no hayas usado antes."
      footer={
        <Link to={paths.forgotPassword} className="font-semibold text-accent-ink">
          Pedir un enlace nuevo
        </Link>
      }
    >
      {token ? (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <TextField
            label="Contraseña nueva"
            type="password"
            autoComplete="new-password"
            hint="Mínimo 8 caracteres, con una mayúscula, una minúscula y un número."
            error={errors.newPassword?.message}
            {...register('newPassword')}
          />
          <TextField
            label="Repite la contraseña nueva"
            type="password"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
          <Button type="submit" loading={isSubmitting} className="w-full">
            Guardar contraseña
          </Button>
        </form>
      ) : (
        <p role="alert" className="text-center text-danger">
          Este enlace no es válido. Pide uno nuevo para recuperar tu contraseña.
        </p>
      )}
    </AuthLayout>
  )
}
