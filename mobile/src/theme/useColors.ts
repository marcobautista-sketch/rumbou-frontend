import { useContext, useMemo } from 'react'
import { useColorScheme } from 'react-native'
import { UniversityContext } from '../contexts/UniversityContext'
import { paletteFor, type Palette } from './colors'

export function useColors(): Palette {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light'
  const university = useContext(UniversityContext)
  return useMemo(() => paletteFor(scheme, university), [scheme, university])
}
