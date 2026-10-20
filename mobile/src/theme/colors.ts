export const palette = {
  light: {
    background: '#f9f9ff',
    surface: '#ffffff',
    border: '#e2e8f0',
    text: '#111c2d',
    muted: '#43474f',
    primary: '#001430',
    onPrimary: '#ffffff',
    accent: '#00ccf9',
    danger: '#ba1a1a',
  },
  dark: {
    background: '#0b1220',
    surface: '#111c2d',
    border: '#263143',
    text: '#ecf1ff',
    muted: '#aab4c8',
    primary: '#aac7fd',
    onPrimary: '#001430',
    accent: '#4cd6ff',
    danger: '#ffb4ab',
  },
} as const

export type Palette = (typeof palette)[keyof typeof palette]
