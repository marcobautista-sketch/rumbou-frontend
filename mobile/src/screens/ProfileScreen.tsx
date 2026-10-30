import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { Button } from '../components/Button'
import { ChangePasswordForm } from '../components/ChangePasswordForm'
import { FormTextField } from '../components/FormTextField'
import { PlanCard } from '../components/PlanCard'
import { useAuth } from '../hooks/useAuth'
import { userService } from '../services/userService'
import { useColors } from '../theme/useColors'
import type { User } from '../types/auth'
import { profileSchema, type ProfileForm } from '../utils/authSchemas'
import { notify } from '../utils/notify'
import { roleLabels } from '../utils/roleLabels'

function EditProfileForm({ user }: { user: User }) {
  const { updateUser } = useAuth()
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, isDirty },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    mode: 'onTouched',
    defaultValues: {
      nombre: user.nombre,
      apellidos: user.apellidos ?? '',
      telefono: user.telefono ?? '',
    },
  })

  const onSubmit = async ({ nombre, apellidos, telefono }: ProfileForm) => {
    try {
      const updated = await userService.updateProfile({
        nombre,
        apellidos: apellidos || null,
        telefono: telefono || null,
      })
      updateUser(updated)
      reset({ nombre, apellidos, telefono })
      notify.success('Tus datos se guardaron.')
    } catch (error) {
      notify.error(error)
    }
  }

  return (
    <View style={styles.section}>
      <FormTextField control={control} name="nombre" label="Nombres" autoComplete="given-name" />
      <FormTextField
        control={control}
        name="apellidos"
        label="Apellidos"
        autoComplete="family-name"
      />
      <FormTextField
        control={control}
        name="telefono"
        label="Celular (opcional)"
        placeholder="987654321"
        hint="9 dígitos, empieza con 9."
        keyboardType="phone-pad"
        autoComplete="tel"
        maxLength={9}
      />
      <Button
        title="Guardar cambios"
        disabled={!isDirty}
        loading={isSubmitting}
        onPress={handleSubmit(onSubmit)}
      />
    </View>
  )
}

export default function ProfileScreen() {
  const colors = useColors()
  const { user, logout } = useAuth()

  if (!user) return null

  const confirmLogout = () =>
    Alert.alert('¿Cerrar sesión?', 'Tendrás que volver a ingresar tu correo y contraseña.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesión', style: 'destructive', onPress: logout },
    ])

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={{ color: colors.muted }}>Correo</Text>
          <Text style={[styles.value, { color: colors.text }]}>{user.email}</Text>
          <Text style={{ color: colors.muted }}>Tipo de cuenta</Text>
          <Text style={[styles.value, { color: colors.text }]}>{roleLabels[user.role]}</Text>
        </View>

        <Text style={[styles.heading, { color: colors.text }]}>Tu plan</Text>
        <PlanCard isAdmin={user.role === 'ADMIN'} />

        <Text style={[styles.heading, { color: colors.text }]}>Tus datos</Text>
        <EditProfileForm user={user} />

        <Text style={[styles.heading, { color: colors.text }]}>Cambiar contraseña</Text>
        <ChangePasswordForm />

        <Button title="Cerrar sesión" variant="secondary" onPress={confirmLogout} />
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { gap: 16, padding: 20 },
  section: { gap: 14 },
  card: { gap: 4, borderRadius: 16, padding: 16 },
  value: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  heading: { fontSize: 18, fontWeight: '700' },
})
