import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
      title={isDark ? 'Modo claro' : 'Modo oscuro'}
      className="rounded-lg p-2 text-ink-muted transition hover:bg-surface-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-accent"
    >
      {isDark ? (
        <Sun aria-hidden className="size-5 animate-fade-in" />
      ) : (
        <Moon aria-hidden className="size-5 animate-fade-in" />
      )}
    </button>
  )
}
