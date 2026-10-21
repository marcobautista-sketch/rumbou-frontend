import { Ionicons } from '@expo/vector-icons'
import { zodResolver } from '@hookform/resolvers/zod'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { StyleSheet, Text, View } from 'react-native'
import { AuthScreenLayout } from '../../components/AuthScreenLayout'
import { Button } from '../../components/Button'
import { FormTextField } from '../../components/FormTextField'
import type { RootStackParamList } from '../../navigation/types'
import { authService } from '../../services/authService'
import { useColors } from '../../theme/useColors'
import { forgotPasswordSchema, type ForgotPasswordForm } from '../../utils/authSchemas'
import { notify } from '../../utils/notify'

type ForgotPasswordScreenProps = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>

export default function ForgotPasswordScreen({ navigation }: ForgotPasswordScreenProps) {
  const colors = useColors()
  const [sentTo, setSentTo] = useState<string | null>(null)
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onTouched',
    defaultValues: { email: '' },
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
    <AuthScreenLayout
      title="Recupera tu contraseña"
      subtitle="Te enviaremos un enlace para crear una contraseña nueva."
    >
      {sentTo ? (
        <View accessibilityLiveRegion="polite" style={styles.sent}>
          <Ionicons name="mail-open-outline" size={48} color={colors.success} />
          <Text style={[styles.centered, { color: colors.text }]}>
            Si <Text style={styles.bold}>{sentTo}</Text> tiene una cuenta, te llegará un correo con
            el enlace. Vence en 30 minutos.
          </Text>
          <Text style={[styles.centered, { color: colors.muted }]}>
            Puedes abrirlo en el celular o en la computadora. Revisa también la carpeta de spam.
          </Text>
        </View>
      ) : (
        <>
          <FormTextField
            control={control}
            name="email"
            label="Correo de tu cuenta"
            placeholder="nombre@correo.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
          />
          <Button title="Enviar enlace" loading={isSubmitting} onPress={handleSubmit(onSubmit)} />
        </>
      )}
      <Button
        title="Volver a iniciar sesión"
        variant="secondary"
        onPress={() => navigation.goBack()}
      />
    </AuthScreenLayout>
  )
}

const styles = StyleSheet.create({
  sent: { alignItems: 'center', gap: 12 },
  centered: { textAlign: 'center', fontSize: 16, lineHeight: 22 },
  bold: { fontWeight: '700' },
})
