import { StyleSheet } from 'react-native'
import { Button as PaperButton } from 'react-native-paper'
import { useColors } from '../theme/useColors'

// primary: la acción principal de la pantalla. secondary: acciones de apoyo. ghost: una
// acción de texto, como un enlace. Por dentro es el botón de React Native Paper (relleno, con
// borde o de texto) con los colores de RumboU.
type ButtonVariant = 'primary' | 'secondary' | 'ghost'

const modes = {
  primary: 'contained',
  secondary: 'outlined',
  ghost: 'text',
} as const

interface ButtonProps {
  title: string
  variant?: ButtonVariant
  loading?: boolean
  disabled?: boolean
  onPress?: () => void
  accessibilityLabel?: string
  accessibilityHint?: string
}

export function Button({
  title,
  variant = 'primary',
  loading = false,
  disabled,
  onPress,
  accessibilityLabel,
  accessibilityHint,
}: ButtonProps) {
  const colors = useColors()

  return (
    <PaperButton
      mode={modes[variant]}
      onPress={onPress}
      loading={loading}
      disabled={disabled || loading}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      textColor={variant === 'secondary' ? colors.text : undefined}
      style={[styles.button, variant === 'secondary' && { borderColor: colors.border }]}
      contentStyle={variant === 'ghost' ? styles.ghostContent : styles.content}
      labelStyle={[styles.label, loading && styles.labelLoading]}
    >
      {title}
    </PaperButton>
  )
}

const styles = StyleSheet.create({
  button: { borderRadius: 12 },
  content: { minHeight: 48 },
  ghostContent: { minHeight: 40 },
  // Margen lateral de 16 (Paper trae 24) para que "Siguiente" quepa en botones angostos. Con
  // la ruedita de carga a la izquierda se deja el de Paper para no pegarla al texto.
  label: { fontSize: 16, fontWeight: '600', letterSpacing: 0, marginHorizontal: 16 },
  labelLoading: { marginLeft: 24 },
})
