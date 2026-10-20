import { useColorScheme } from 'react-native'
import { palette, type Palette } from './colors'

export function useColors(): Palette {
  return useColorScheme() === 'dark' ? palette.dark : palette.light
}
