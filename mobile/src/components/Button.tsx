import { ActivityIndicator, Pressable, StyleSheet, Text, type PressableProps } from 'react-native'
import { useColors } from '../theme/useColors'

interface ButtonProps extends Omit<PressableProps, 'children' | 'style' | 'onPress'> {
  title: string
  variant?: 'primary' | 'secondary'
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
  const isPrimary = variant === 'primary'
  const inactive = disabled || loading

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      style={({ pressed }) => [
        styles.button,
        isPrimary
          ? { backgroundColor: colors.primary }
          : { borderColor: colors.border, borderWidth: 1 },
        (pressed || inactive) && styles.dimmed,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? '#ffffff' : colors.primary} />
      ) : (
        <Text style={[styles.title, { color: isPrimary ? '#ffffff' : colors.text }]}>{title}</Text>
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
  dimmed: {
    opacity: 0.7,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
})
