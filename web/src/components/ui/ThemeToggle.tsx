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
      className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-indigo-500 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
    >
      {isDark ? (
        <Sun aria-hidden className="size-5 animate-fade-in" />
      ) : (
        <Moon aria-hidden className="size-5 animate-fade-in" />
      )}
    </button>
  )
}
