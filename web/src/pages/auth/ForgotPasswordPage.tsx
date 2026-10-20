import { zodResolver } from '@hookform/resolvers/zod'
import { MailCheck } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router'
import { authService } from '../../api/authService'
import { AuthLayout } from '../../components/auth/AuthLayout'
import { Button } from '../../components/ui/Button'
import { TextField } from '../../components/ui/TextField'
import { paths } from '../../routes/paths'
import { notify } from '../../utils/notify'
import { forgotPasswordSchema, type ForgotPasswordForm } from './authSchemas'

export default function ForgotPasswordPage() {
  const [sentTo, setSentTo] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onTouched',
  })

  const onSubmit = async ({ email }: ForgotPasswordForm) => {
    try {
      await authService.forgotPassword(email)
      setSentTo(email)
    } catch (error) {
      notify.error(error)
    }
  }

  return (
    <AuthLayout
      title="Recupera tu contraseña"
      subtitle="Te enviaremos un enlace para crear una contraseña nueva."
      footer={
        <Link to={paths.login} className="font-medium text-indigo-600 dark:text-indigo-400">
          Volver a iniciar sesión
        </Link>
      }
    >
      {sentTo ? (
        <div role="status" className="space-y-3 text-center">
          <MailCheck aria-hidden className="mx-auto size-12 text-emerald-500" />
          <p>
            Si <strong className="break-words">{sentTo}</strong> tiene una cuenta, te llegará un
            correo con el enlace. Vence en 30 minutos.
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Revisa también la carpeta de spam.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <TextField
            label="Correo de tu cuenta"
            type="email"
            autoComplete="email"
            placeholder="nombre@correo.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <Button type="submit" loading={isSubmitting} className="w-full">
            Enviar enlace
          </Button>
        </form>
      )}
    </AuthLayout>
  )
}
