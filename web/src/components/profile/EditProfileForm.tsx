import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { userService } from '../../api/userService'
import { namesField, phoneField, surnamesField } from '../../pages/auth/authSchemas'
import type { User } from '../../types/auth'
import { notify } from '../../utils/notify'
import { Button } from '../ui/Button'
import { TextField } from '../ui/TextField'

const profileSchema = z.object({
  nombre: namesField,
  apellidos: surnamesField.or(z.literal('')),
  telefono: phoneField,
})

type ProfileForm = z.infer<typeof profileSchema>

interface EditProfileFormProps {
  user: User
  onSaved: (user: User) => void
  onCancel: () => void
}

export function EditProfileForm({ user, onSaved, onCancel }: EditProfileFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
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
      notify.success('Tus datos se guardaron.')
      onSaved(updated)
    } catch (error) {
      notify.error(error)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Nombres"
          autoComplete="given-name"
          error={errors.nombre?.message}
          {...register('nombre')}
        />
        <TextField
          label="Apellidos"
          autoComplete="family-name"
          error={errors.apellidos?.message}
          {...register('apellidos')}
        />
      </div>
      <TextField
        label="Celular (opcional)"
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        placeholder="987654321"
        error={errors.telefono?.message}
        {...register('telefono')}
      />
      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" loading={isSubmitting} disabled={!isDirty}>
          Guardar cambios
        </Button>
      </div>
    </form>
  )
}
