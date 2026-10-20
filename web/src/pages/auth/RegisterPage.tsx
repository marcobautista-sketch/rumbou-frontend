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
import { registerSchema, type RegisterForm } from './authSchemas'

export default function RegisterPage() {
  const { register: createAccount } = useAuth()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema), mode: 'onTouched' })

  const onSubmit = async ({ nombre, email, password }: RegisterForm) => {
    try {
      await createAccount({ nombre, email, password })
      notify.success('¡Tu cuenta está lista! Te enviamos un correo de bienvenida.')
    } catch (error) {
      const apiError = toApiError(error)
      if (apiError.kind === 'conflict') {
        setError('email', { message: 'Ya existe una cuenta con este correo' })
      } else {
        notify.error(apiError)
      }
    }
  }

  return (
    <AuthLayout
      title="Crea tu cuenta"
      subtitle="Rinde simulacros reales de la UNI y San Marcos."
      footer={
        <>
          ¿Ya tienes cuenta?{' '}
          <Link to={paths.login} className="font-semibold text-accent-ink">
            Inicia sesión
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <TextField
          label="Nombre"
          autoComplete="name"
          placeholder="¿Cómo te llamas?"
          error={errors.nombre?.message}
          {...register('nombre')}
        />
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
          autoComplete="new-password"
          hint="Mínimo 8 caracteres, con una mayúscula, una minúscula y un número."
          error={errors.password?.message}
          {...register('password')}
        />
        <TextField
          label="Repite tu contraseña"
          type="password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
        <Button type="submit" loading={isSubmitting} className="w-full">
          Crear cuenta
        </Button>
      </form>
    </AuthLayout>
  )
}
