import { useState } from 'react'
import { useController, type Control, type FieldValues, type Path } from 'react-hook-form'
import { StyleSheet, View, type TextInputProps } from 'react-native'
import { HelperText, TextInput } from 'react-native-paper'
import { useColors } from '../theme/useColors'

interface FormTextFieldProps<T extends FieldValues> extends Pick<
  TextInputProps,
  | 'autoComplete'
  | 'autoCapitalize'
  | 'keyboardType'
  | 'maxLength'
  | 'placeholder'
  | 'secureTextEntry'
  | 'textContentType'
> {
  control: Control<T>
  name: Path<T>
  label: string
  hint?: string
}

// Campo de formulario conectado a react-hook-form. Por dentro es el TextInput "outlined" de
// React Native Paper (con la etiqueta dentro del recuadro) y su HelperText para la ayuda o el error.
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
    <View>
      <TextInput
        mode="outlined"
        label={label}
        accessibilityLabel={label}
        value={String(field.value ?? '')}
        onChangeText={field.onChange}
        onBlur={field.onBlur}
        secureTextEntry={hidden}
        error={Boolean(error)}
        outlineColor={colors.border}
        activeOutlineColor={colors.primary}
        outlineStyle={styles.outline}
        style={{ backgroundColor: colors.surface }}
        right={
          secureTextEntry ? (
            <TextInput.Icon
              icon={hidden ? 'eye-outline' : 'eye-off-outline'}
              accessibilityLabel={hidden ? 'Mostrar contraseña' : 'Ocultar contraseña'}
              onPress={() => setHidden((value) => !value)}
            />
          ) : undefined
        }
        {...inputProps}
      />
      {message && (
        <HelperText type={error ? 'error' : 'info'} visible padding="none">
          {message}
        </HelperText>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  outline: { borderRadius: 12 },
})
