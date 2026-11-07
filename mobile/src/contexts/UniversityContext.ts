import { createContext } from 'react'
import type { University } from '../theme/colors'

export const UniversityContext = createContext<University | null>(null)
