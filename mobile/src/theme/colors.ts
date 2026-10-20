export const palette = {
  light: {
    background: '#f8fafc',
    surface: '#ffffff',
    border: '#cbd5e1',
    text: '#0f172a',
    muted: '#475569',
    primary: '#4f46e5',
    danger: '#dc2626',
  },
  dark: {
    background: '#020617',
    surface: '#0f172a',
    border: '#334155',
    text: '#f1f5f9',
    muted: '#94a3b8',
    primary: '#818cf8',
    danger: '#f87171',
  },
} as const

export type Palette = (typeof palette)[keyof typeof palette]
