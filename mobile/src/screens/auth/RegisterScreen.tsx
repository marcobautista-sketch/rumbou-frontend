import { zodResolver } from '@hookform/resolvers/zod'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useForm } from 'react-hook-form'
import { AuthScreenLayout } from '../../components/AuthScreenLayout'
import { Button } from '../../components/Button'
import { FormTextField } from '../../components/FormTextField'
import { useAuth } from '../../hooks/useAuth'
import type { RootStackParamList } from '../../navigation/types'
import { toApiError } from '../../services/apiError'
import { registerSchema, type RegisterForm } from '../../utils/authSchemas'
import { notify } from '../../utils/notify'

type RegisterScreenProps = NativeStackScreenProps<RootStackParamList, 'Register'>

export default function RegisterScreen({ navigation }: RegisterScreenProps) {
  const { register } = useAuth()
  const {
    control,
    handleSubmit,
    setError,
    formState: { isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
    defaultValues: { nombre: '', email: '', password: '', confirmPassword: '' },
  })

  const onSubmit = async ({ nombre, email, password }: RegisterForm) => {
    try {
      await register({ nombre, email, password })
      notify.success('¡Tu cuenta está lista!')
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
    <AuthScreenLayout
      title="Crea tu cuenta"
      subtitle="Rinde simulacros reales de la UNI y San Marcos."
    >
      <FormTextField
        control={control}
        name="nombre"
        label="Nombre"
        placeholder="¿Cómo te llamas?"
        autoComplete="name"
        textContentType="name"
      />
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
        hint="Mínimo 8 caracteres, con una mayúscula, una minúscula y un número."
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
      />
      <FormTextField
        control={control}
        name="confirmPassword"
        label="Repite tu contraseña"
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
      />
      <Button title="Crear cuenta" loading={isSubmitting} onPress={handleSubmit(onSubmit)} />
      <Button title="Ya tengo cuenta" variant="secondary" onPress={() => navigation.goBack()} />
    </AuthScreenLayout>
  )
}
