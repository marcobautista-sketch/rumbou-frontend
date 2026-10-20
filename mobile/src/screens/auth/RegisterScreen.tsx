import { zodResolver } from '@hookform/resolvers/zod'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useCallback, useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from 'react-native'
import { AuthScreenLayout } from '../../components/AuthScreenLayout'
import { Button } from '../../components/Button'
import { ErrorRetry } from '../../components/ErrorRetry'
import { FormTextField } from '../../components/FormTextField'
import { OptionList } from '../../components/OptionList'
import { ProgressBar } from '../../components/ProgressBar'
import { useAuth } from '../../hooks/useAuth'
import { useFetch } from '../../hooks/useFetch'
import type { RootStackParamList } from '../../navigation/types'
import { toApiError } from '../../services/apiError'
import { goalService } from '../../services/goalService'
import { useColors } from '../../theme/useColors'
import { registerSchema, type RegisterForm } from '../../utils/authSchemas'
import { notify } from '../../utils/notify'

type RegisterScreenProps = NativeStackScreenProps<RootStackParamList, 'Register'>

const steps = [
  {
    title: 'Cuéntanos sobre ti',
    subtitle: 'Así personalizamos tu preparación.',
    fields: ['nombre', 'apellidos', 'telefono'],
  },
  {
    title: 'Crea tu cuenta',
    subtitle: 'Con este correo entrarás a RumboU.',
    fields: ['email', 'password', 'confirmPassword'],
  },
  {
    title: '¿Cuál es tu meta?',
    subtitle: 'Enfocamos cada simulacro en el examen de tu universidad.',
    fields: ['universidad', 'ofertaAcademicaId'],
  },
] as const satisfies readonly {
  title: string
  subtitle: string
  fields: readonly (keyof RegisterForm)[]
}[]

const universityNames: Record<string, string> = {
  UNI: 'UNI · Universidad Nacional de Ingeniería',
  UNMSM: 'UNMSM · Universidad Nacional Mayor de San Marcos',
}

export default function RegisterScreen({ navigation }: RegisterScreenProps) {
  const colors = useColors()
  const [step, setStep] = useState(0)
  const [search, setSearch] = useState('')
  const { register } = useAuth()
  const {
    control,
    handleSubmit,
    trigger,
    setValue,
    resetField,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
    defaultValues: {
      nombre: '',
      apellidos: '',
      telefono: '',
      email: '',
      password: '',
      confirmPassword: '',
      universidad: '',
    },
  })
  const [universidad, ofertaAcademicaId] = useWatch({
    control,
    name: ['universidad', 'ofertaAcademicaId'],
  })
  const fetchOffers = useCallback((signal: AbortSignal) => goalService.listOffers(signal), [])
  const offers = useFetch(fetchOffers)
  const universities = useMemo(
    () => [...new Set(offers.data?.map((offer) => offer.universidad))],
    [offers.data],
  )
  const careers = useMemo(
    () =>
      (offers.data ?? [])
        .filter((offer) => offer.universidad === universidad)
        .filter((offer) => offer.carrera.toLowerCase().includes(search.trim().toLowerCase()))
        .sort((a, b) => a.carrera.localeCompare(b.carrera, 'es')),
    [offers.data, universidad, search],
  )
  const current = steps[step]
  const isLastStep = step === steps.length - 1

  const goNext = async () => {
    if (await trigger([...current.fields])) setStep((value) => value + 1)
  }

  const onSubmit = async (form: RegisterForm) => {
    try {
      await register({
        nombre: form.nombre,
        apellidos: form.apellidos,
        telefono: form.telefono || undefined,
        email: form.email,
        password: form.password,
      })
    } catch (error) {
      const apiError = toApiError(error)
      if (apiError.kind === 'conflict') {
        setStep(1)
        setError('email', { message: 'Ya existe una cuenta con este correo' })
      } else {
        notify.error(apiError)
      }
      return
    }
    try {
      await goalService.create(form.ofertaAcademicaId)
      notify.success('¡Tu cuenta está lista y tu meta, guardada!')
    } catch (error) {
      notify.error(error)
    }
  }

  return (
    <AuthScreenLayout title={current.title} subtitle={current.subtitle}>
      <View style={styles.row}>
        <View style={styles.flex}>
          <ProgressBar value={step + 1} max={steps.length} label="Avance del registro" />
        </View>
        <Text style={[styles.stepLabel, { color: colors.muted }]}>
          Paso {step + 1} de {steps.length}
        </Text>
      </View>

      {step === 0 && (
        <>
          <FormTextField
            control={control}
            name="nombre"
            label="Nombres"
            placeholder="¿Cómo te llamas?"
            autoComplete="given-name"
          />
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
            keyboardType="number-pad"
            autoComplete="tel"
            hint="Solo para avisarte de tus simulacros. No lo compartimos."
          />
        </>
      )}

      {step === 1 && (
        <>
          <FormTextField
            control={control}
            name="email"
            label="Correo"
            placeholder="nombre@correo.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          <FormTextField
            control={control}
            name="password"
            label="Contraseña"
            hint="Mínimo 8 caracteres, con una mayúscula, una minúscula y un número."
            secureTextEntry
            autoComplete="new-password"
          />
          <FormTextField
            control={control}
            name="confirmPassword"
            label="Repite tu contraseña"
            secureTextEntry
          />
        </>
      )}

      {step === 2 &&
        (offers.error ? (
          <ErrorRetry message={offers.error.message} onRetry={offers.retry} />
        ) : offers.loading ? (
          <ActivityIndicator color={colors.primary} accessibilityLabel="Cargando universidades" />
        ) : (
          <>
            <Text style={[styles.label, { color: colors.text }]}>
              Universidad a la que postulas
            </Text>
            <OptionList
              accessibilityLabel="Universidad a la que postulas"
              options={universities.map((siglas) => ({
                value: siglas,
                label: universityNames[siglas] ?? siglas,
              }))}
              selected={universidad || null}
              onSelect={(value) => {
                setValue('universidad', value, { shouldValidate: true })
                resetField('ofertaAcademicaId')
              }}
            />
            {universidad !== '' && (
              <>
                <Text style={[styles.label, { color: colors.text }]}>
                  Carrera que deseas estudiar
                </Text>
                <TextInput
                  accessibilityLabel="Buscar carrera"
                  placeholder="Busca tu carrera"
                  placeholderTextColor={colors.muted}
                  value={search}
                  onChangeText={setSearch}
                  style={[
                    styles.search,
                    {
                      borderColor: colors.border,
                      color: colors.text,
                      backgroundColor: colors.surface,
                    },
                  ]}
                />
                <OptionList
                  accessibilityLabel="Carrera que deseas estudiar"
                  options={careers.map((offer) => ({ value: offer.id, label: offer.carrera }))}
                  selected={ofertaAcademicaId ?? null}
                  onSelect={(value) =>
                    setValue('ofertaAcademicaId', value, { shouldValidate: true })
                  }
                />
              </>
            )}
            <Text style={{ color: colors.danger }}>
              {(errors.universidad ?? errors.ofertaAcademicaId)?.message}
            </Text>
          </>
        ))}

      <View style={styles.row}>
        {step > 0 && (
          <View style={styles.flex}>
            <Button
              title="Atrás"
              variant="secondary"
              onPress={() => setStep((value) => value - 1)}
            />
          </View>
        )}
        <View style={styles.flex}>
          {isLastStep ? (
            <Button
              title="Finalizar registro"
              loading={isSubmitting}
              onPress={handleSubmit(onSubmit)}
            />
          ) : (
            <Button title="Siguiente" onPress={goNext} />
          )}
        </View>
      </View>
      {step === 0 && (
        <Button title="Ya tengo cuenta" variant="secondary" onPress={() => navigation.goBack()} />
      )}
    </AuthScreenLayout>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  flex: { flex: 1 },
  stepLabel: { fontWeight: '600' },
  label: { fontSize: 14, fontWeight: '600' },
  search: { minHeight: 48, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, fontSize: 16 },
})
