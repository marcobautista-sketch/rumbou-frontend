import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { StyleSheet, View } from 'react-native'
import { toApiError } from '../services/apiError'
import { userService } from '../services/userService'
import { changePasswordSchema, type ChangePasswordForm as Form } from '../utils/authSchemas'
import { notify } from '../utils/notify'
import { Button } from './Button'
import { FormTextField } from './FormTextField'

const emptyForm: Form = { currentPassword: '', newPassword: '', confirmPassword: '' }

export function ChangePasswordForm() {
  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { isSubmitting },
  } = useForm<Form>({
    resolver: zodResolver(changePasswordSchema),
    mode: 'onTouched',
    defaultValues: emptyForm,
  })

  const onSubmit = async ({ currentPassword, newPassword }: Form) => {
    try {
      await userService.changePassword(currentPassword, newPassword)
      reset(emptyForm)
      notify.success('Tu contraseña se cambió.')
    } catch (error) {
      // 400: la contraseña actual no coincide; se marca en su propio campo.
      const apiError = toApiError(error)
      if (apiError.kind === 'validation') {
        setError('currentPassword', { message: apiError.message })
      } else {
        notify.error(apiError)
      }
    }
  }

  return (
    <View style={styles.form}>
      <FormTextField
        control={control}
        name="currentPassword"
        label="Contraseña actual"
        secureTextEntry
        autoComplete="current-password"
      />
      <FormTextField
        control={control}
        name="newPassword"
        label="Contraseña nueva"
        hint="Mínimo 8 caracteres, con una mayúscula, una minúscula y un número."
        secureTextEntry
        autoComplete="new-password"
      />
      <FormTextField
        control={control}
        name="confirmPassword"
        label="Repite la contraseña nueva"
        secureTextEntry
      />
      <Button title="Cambiar contraseña" loading={isSubmitting} onPress={handleSubmit(onSubmit)} />
    </View>
  )
}

const styles = StyleSheet.create({
  form: { gap: 14 },
})
