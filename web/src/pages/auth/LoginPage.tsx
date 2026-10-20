import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router'
import { toApiError } from '../../api/apiError'
import { AuthLayout } from '../../components/auth/AuthLayout'
import { Button } from '../../components/ui/Button'
import { TextField } from '../../components/ui/TextField'
import { useAuth } from '../../hooks/useAuth'
import { paths } from '../../routes/paths'
import { notify } from '../../utils/notify'
import { loginSchema, type LoginForm } from './authSchemas'

export default function LoginPage() {
  const { login } = useAuth()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema), mode: 'onTouched' })

  const onSubmit = async (credentials: LoginForm) => {
    try {
      await login(credentials)
      notify.success('¡Qué bueno verte de nuevo!')
    } catch (error) {
      if (toApiError(error).kind === 'unauthorized') {
        setError('password', { message: 'El correo o la contraseña no son correctos' })
      } else {
        notify.error(error)
      }
    }
  }

  return (
    <AuthLayout
      title="Inicia sesión"
      subtitle="Continúa tu preparación para el examen de admisión."
      footer={
        <>
          ¿Todavía no tienes cuenta?{' '}
          <Link to={paths.register} className="font-medium text-indigo-600 dark:text-indigo-400">
            Regístrate gratis
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <TextField
          label="Correo"
          type="email"
          autoComplete="email"
          placeholder="nombre@correo.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <TextField
          label="Contraseña"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <Button type="submit" loading={isSubmitting} className="w-full">
          Iniciar sesión
        </Button>
      </form>
    </AuthLayout>
  )
}
