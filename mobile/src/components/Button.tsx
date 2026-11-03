import { ActivityIndicator, Pressable, StyleSheet, Text, type PressableProps } from 'react-native'
import { useColors } from '../theme/useColors'

// primary: la acción principal de la pantalla. secondary: acciones de apoyo. ghost: una
// acción de texto, como un enlace. Las mismas variantes que en la web.
type ButtonVariant = 'primary' | 'secondary' | 'ghost'

interface ButtonProps extends Omit<PressableProps, 'children' | 'style' | 'onPress'> {
  title: string
  variant?: ButtonVariant
  loading?: boolean
  onPress?: () => void
}

export function Button({
  title,
  variant = 'primary',
  loading = false,
  disabled,
  ...props
}: ButtonProps) {
  const colors = useColors()
  const inactive = disabled || loading
  const textColor =
    variant === 'primary' ? colors.onPrimary : variant === 'ghost' ? colors.primary : colors.text

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      style={({ pressed }) => [
        styles.button,
        variant === 'primary' && { backgroundColor: colors.primary },
        variant === 'secondary' && {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: 1,
        },
        variant === 'ghost' && styles.ghost,
        (pressed || inactive) && styles.dimmed,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.title, { color: textColor }]}>{title}</Text>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  ghost: {
    minHeight: 40,
  },
  dimmed: {
    opacity: 0.6,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
})
