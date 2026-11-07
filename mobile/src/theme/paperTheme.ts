import { MD3DarkTheme, MD3LightTheme, type MD3Theme } from 'react-native-paper'
import { paletteFor, type ColorScheme, type Palette, type University } from './colors'

// React Native Paper trae el morado de Material Design por defecto. Aquí sus colores se toman
// de la paleta Cuaderno, para que sus componentes se vean igual que el resto de RumboU.
function paperTheme(base: MD3Theme, colors: Palette): MD3Theme {
  return {
    ...base,
    // Paper calcula las esquinas de cada componente a partir de este número (el selector
    // Lápiz/Borrador queda en 15 px). Botones y campos fijan las suyas en 12 px, como la web.
    roundness: 3,
    colors: {
      ...base.colors,
      primary: colors.primary,
      onPrimary: colors.onPrimary,
      primaryContainer: colors.chip,
      onPrimaryContainer: colors.primary,
      secondary: colors.accent,
      onSecondary: colors.onAccent,
      secondaryContainer: colors.chip,
      onSecondaryContainer: colors.primary,
      tertiary: colors.accentText,
      background: colors.background,
      onBackground: colors.text,
      surface: colors.surface,
      onSurface: colors.text,
      surfaceVariant: colors.surfaceMuted,
      onSurfaceVariant: colors.muted,
      outline: colors.border,
      outlineVariant: colors.border,
      error: colors.danger,
      errorContainer: colors.dangerSoft,
      onErrorContainer: colors.danger,
      elevation: {
        ...base.colors.elevation,
        level1: colors.surface,
        level2: colors.surface,
        level3: colors.surface,
      },
    },
  }
}

export function paperThemeFor(scheme: ColorScheme, university: University | null) {
  return paperTheme(
    scheme === 'dark' ? MD3DarkTheme : MD3LightTheme,
    paletteFor(scheme, university),
  )
}
