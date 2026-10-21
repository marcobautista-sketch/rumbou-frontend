import { zodResolver } from '@hookform/resolvers/zod'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Alert, Pressable, StyleSheet, Text } from 'react-native'
import { AuthScreenLayout } from '../../components/AuthScreenLayout'
import { Button } from '../../components/Button'
import { FormTextField } from '../../components/FormTextField'
import { useAuth } from '../../hooks/useAuth'
import type { RootStackParamList } from '../../navigation/types'
import { toApiError } from '../../services/apiError'
import { biometricService } from '../../services/biometricService'
import { useColors } from '../../theme/useColors'
import { loginSchema, type LoginForm } from '../../utils/authSchemas'
import { notify } from '../../utils/notify'

type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>

async function offerBiometricLogin() {
  if ((await biometricService.isEnabled()) || !(await biometricService.isAvailable())) return

  Alert.alert(
    '¿Entrar con tu huella?',
    'La próxima vez podrás entrar con tu huella o Face ID, sin escribir tu contraseña.',
    [
      { text: 'Ahora no', style: 'cancel' },
      {
        text: 'Activar',
        onPress: async () => {
          if (!(await biometricService.authenticate())) return
          await biometricService.enable()
          notify.success('Listo: la próxima vez entra con tu huella.')
        },
      },
    ],
  )
}

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const colors = useColors()
  const { login, status, unlockWithBiometrics } = useAuth()
  const locked = status === 'locked'
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

  const unlock = useCallback(async () => {
    try {
      if (await unlockWithBiometrics()) notify.success('¡Qué bueno verte de nuevo!')
    } catch (error) {
      notify.error(error)
    }
  }, [unlockWithBiometrics])

  useEffect(() => {
    if (locked) unlock()
  }, [locked, unlock])

  const onSubmit = async (credentials: LoginForm) => {
    try {
      await login(credentials)
      notify.success('¡Qué bueno verte de nuevo!')
      await offerBiometricLogin()
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
      {locked && <Button title="Entrar con huella o Face ID" onPress={unlock} />}
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
      <Pressable
        accessibilityRole="link"
        onPress={() => navigation.navigate('ForgotPassword')}
        style={styles.link}
      >
        <Text style={[styles.linkText, { color: colors.accentText }]}>
          ¿Olvidaste tu contraseña?
        </Text>
      </Pressable>
      <Button
        title="Iniciar sesión"
        variant={locked ? 'secondary' : 'primary'}
        loading={isSubmitting}
        onPress={handleSubmit(onSubmit)}
      />
      <Button
        title="Crear una cuenta"
        variant="secondary"
        onPress={() => navigation.navigate('Register')}
      />
    </AuthScreenLayout>
  )
}

const styles = StyleSheet.create({
  link: { alignSelf: 'flex-end', minHeight: 44, justifyContent: 'center' },
  linkText: { fontWeight: '600' },
})
