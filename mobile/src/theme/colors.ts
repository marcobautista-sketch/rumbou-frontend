export const palette = {
  light: {
    background: '#f8fafc',
    text: '#0f172a',
    muted: '#475569',
    primary: '#4f46e5',
  },
  dark: {
    background: '#020617',
    text: '#f1f5f9',
    muted: '#cbd5e1',
    primary: '#818cf8',
  },
} as const

export type Palette = (typeof palette)[keyof typeof palette]
