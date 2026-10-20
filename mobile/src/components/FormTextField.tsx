import { Ionicons } from '@expo/vector-icons'
import { useState } from 'react'
import { useController, type Control, type FieldValues, type Path } from 'react-hook-form'
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native'
import { useColors } from '../theme/useColors'

interface FormTextFieldProps<T extends FieldValues> extends Omit<
  TextInputProps,
  'value' | 'onChangeText' | 'onBlur'
> {
  control: Control<T>
  name: Path<T>
  label: string
  hint?: string
}

export function FormTextField<T extends FieldValues>({
  control,
  name,
  label,
  hint,
  secureTextEntry = false,
  ...inputProps
}: FormTextFieldProps<T>) {
  const colors = useColors()
  const { field, fieldState } = useController({ control, name })
  const [hidden, setHidden] = useState(secureTextEntry)
  const error = fieldState.error?.message
  const message = error ?? hint

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <View
        style={[
          styles.inputRow,
          { backgroundColor: colors.surface, borderColor: error ? colors.danger : colors.border },
        ]}
      >
        <TextInput
          accessibilityLabel={label}
          value={String(field.value ?? '')}
          onChangeText={field.onChange}
          onBlur={field.onBlur}
          secureTextEntry={hidden}
          placeholderTextColor={colors.muted}
          style={[styles.input, { color: colors.text }]}
          {...inputProps}
        />
        {secureTextEntry && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Mostrar contraseña' : 'Ocultar contraseña'}
            onPress={() => setHidden((value) => !value)}
            hitSlop={12}
          >
            <Ionicons
              name={hidden ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color={colors.muted}
            />
          </Pressable>
        )}
      </View>
      {message && (
        <Text
          accessibilityLiveRegion={error ? 'polite' : 'none'}
          style={[styles.message, { color: error ? colors.danger : colors.muted }]}
        >
          {message}
        </Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    minHeight: 48,
    fontSize: 16,
  },
  message: {
    fontSize: 13,
  },
})
