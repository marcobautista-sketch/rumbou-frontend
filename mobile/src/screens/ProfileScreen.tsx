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
import { Avatar } from 'react-native-paper'
import { Button } from '../components/Button'
import { ChangePasswordForm } from '../components/ChangePasswordForm'
import { FormTextField } from '../components/FormTextField'
import { PlanCard } from '../components/PlanCard'
import { SensorCheck } from '../components/SensorCheck'
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

function initialsOf(name: string) {
  const words = name.trim().split(/s+/).filter(Boolean)
  const initials = words.length > 1 ? words[0][0] + words[1][0] : (words[0]?.slice(0, 2) ?? '?')
  return initials.toUpperCase()
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
        <View style={[styles.card, styles.identity, { backgroundColor: colors.surface }]}>
          <Avatar.Text
            size={56}
            label={initialsOf(user.nombre)}
            color={colors.primary}
            style={{ backgroundColor: colors.chip }}
            labelStyle={styles.avatarText}
          />
          <View style={styles.flex}>
            <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
              {[user.nombre, user.apellidos].filter(Boolean).join(' ')}
            </Text>
            <Text style={{ color: colors.muted }} numberOfLines={1}>
              {user.email}
            </Text>
            <Text style={[styles.role, { color: colors.primary }]}>{roleLabels[user.role]}</Text>
          </View>
        </View>

        <Text style={[styles.heading, { color: colors.text }]}>Tu plan</Text>
        <PlanCard isAdmin={user.role === 'ADMIN'} />

        <Text style={[styles.heading, { color: colors.text }]}>Tus datos</Text>
        <EditProfileForm user={user} />

        <Text style={[styles.heading, { color: colors.text }]}>Cambiar contraseña</Text>
        <ChangePasswordForm />

        <SensorCheck />

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
  identity: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatarText: { fontSize: 20, fontWeight: '800' },
  name: { fontSize: 18, fontWeight: '800' },
  role: { marginTop: 2, fontSize: 13, fontWeight: '700' },
  heading: { fontSize: 18, fontWeight: '800', marginTop: 4 },
})
