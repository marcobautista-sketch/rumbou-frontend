import { zodResolver } from '@hookform/resolvers/zod'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useForm } from 'react-hook-form'
import { AuthScreenLayout } from '../../components/AuthScreenLayout'
import { Button } from '../../components/Button'
import { FormTextField } from '../../components/FormTextField'
import { useAuth } from '../../hooks/useAuth'
import type { RootStackParamList } from '../../navigation/types'
import { toApiError } from '../../services/apiError'
import { loginSchema, type LoginForm } from '../../utils/authSchemas'
import { notify } from '../../utils/notify'

type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const { login } = useAuth()
  const {
    control,
    handleSubmit,
    setError,
    formState: { isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
    defaultValues: { email: '', password: '' },
  })

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
    <AuthScreenLayout
      title="Inicia sesión"
      subtitle="Continúa tu preparación para el examen de admisión."
    >
      <FormTextField
        control={control}
        name="email"
        label="Correo"
        placeholder="nombre@correo.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
      />
      <FormTextField
        control={control}
        name="password"
        label="Contraseña"
        secureTextEntry
        autoComplete="current-password"
        textContentType="password"
      />
      <Button title="Iniciar sesión" loading={isSubmitting} onPress={handleSubmit(onSubmit)} />
      <Button
        title="Crear una cuenta"
        variant="secondary"
        onPress={() => navigation.navigate('Register')}
      />
    </AuthScreenLayout>
  )
}
