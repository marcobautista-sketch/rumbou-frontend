type AvatarSize = 'sm' | 'md' | 'lg'

const sizes: Record<AvatarSize, string> = {
  sm: 'size-8 text-xs',
  md: 'size-10 text-sm',
  lg: 'size-16 text-xl',
}

// Tonos suaves de la paleta: distinguen a cada persona sin salirse de los colores de la app.
const palette = [
  'bg-chip text-primary',
  'bg-accent-soft text-accent-ink',
  'bg-warning-soft text-warning',
  'bg-surface-muted text-ink',
]

interface AvatarProps {
  name: string
  size?: AvatarSize
}

function initialsOf(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean)
  const initials = words.length > 1 ? words[0][0] + words[1][0] : (words[0]?.slice(0, 2) ?? '?')
  return initials.toUpperCase()
}

function colorOf(name: string) {
  const hash = [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return palette[hash % palette.length]
}

export function Avatar({ name, size = 'md' }: AvatarProps) {
  return (
    <span
      role="img"
      aria-label={name}
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold select-none ${sizes[size]} ${colorOf(name)}`}
    >
      {initialsOf(name)}
    </span>
  )
}
