// Paleta "Cuaderno": azul lapicero sobre papel, con verde agua para el progreso. La misma que la web.
export const palette = {
  light: {
    background: '#f7f6f1',
    surface: '#fffffd',
    border: '#e2e0d6',
    text: '#1e2430',
    muted: '#565c68',
    primary: '#2452c4',
    onPrimary: '#ffffff',
    accent: '#12a08a',
    accentSoft: '#dcf3ee',
    accentText: '#0a6b5c',
    onAccent: '#05302a',
    chip: '#e6ecfa',
    surfaceMuted: '#f0efe8',
    success: '#25793d',
    successSoft: '#e2f2e5',
    warning: '#a15c00',
    warningSoft: '#fbefdc',
    danger: '#c22c25',
    dangerSoft: '#fbe3e1',
    grid: '#e3e8f2',
  },
  dark: {
    background: '#121419',
    surface: '#1a1d24',
    border: '#2e323c',
    text: '#edeef1',
    muted: '#a8adb8',
    primary: '#8eaaff',
    onPrimary: '#0f1422',
    accent: '#45cdb4',
    accentSoft: '#133a34',
    accentText: '#45cdb4',
    onAccent: '#05302a',
    chip: '#232c42',
    surfaceMuted: '#22262f',
    success: '#7bcf8c',
    successSoft: '#17331e',
    warning: '#f2b45b',
    warningSoft: '#3a2a12',
    danger: '#ff8c84',
    dangerSoft: '#43201e',
    grid: '#272c37',
  },
} as const

export type Palette = Record<keyof (typeof palette)['light'], string>
export type ColorScheme = keyof typeof palette
export type University = 'UNI' | 'UNMSM'

type UniversityAccents = Pick<Palette, 'primary' | 'onPrimary' | 'chip'>

// Cada universidad cambia solo los acentos: acierto, error y aviso conservan su color para que
// no cambie su significado. UNI sale de su manual de identidad (Granate y Beige Arena). UNMSM
// usa tonos inspirados en sus azules, sin sus signos. El logo de RumboU no cambia.
const universityAccents: Record<University, Record<ColorScheme, UniversityAccents>> = {
  UNI: {
    light: { primary: '#711610', onPrimary: '#ffffff', chip: '#f4e9d0' },
    dark: { primary: '#e6d9aa', onPrimary: '#2b1a10', chip: '#3b2f1d' },
  },
  UNMSM: {
    light: { primary: '#14407f', onPrimary: '#ffffff', chip: '#e1ecf8' },
    dark: { primary: '#8fc2f2', onPrimary: '#0b1f33', chip: '#17304a' },
  },
}

export function isUniversity(siglas: string): siglas is University {
  return siglas in universityAccents
}

export function paletteFor(scheme: ColorScheme, university: University | null): Palette {
  return university
    ? { ...palette[scheme], ...universityAccents[university][scheme] }
    : palette[scheme]
}
