import { DarkTheme, DefaultTheme, type Theme } from '@react-navigation/native'
import { paletteFor, type ColorScheme, type Palette, type University } from './colors'

// Los encabezados y la barra de pestañas usan la paleta Cuaderno, no los grises por defecto
// de React Navigation: así la app se ve igual que la web.
function themeFrom(base: Theme, colors: Palette): Theme {
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.background,
      text: colors.text,
      border: colors.border,
      notification: colors.danger,
    },
  }
}

export function navigationThemeFor(scheme: ColorScheme, university: University | null) {
  return themeFrom(scheme === 'dark' ? DarkTheme : DefaultTheme, paletteFor(scheme, university))
}
