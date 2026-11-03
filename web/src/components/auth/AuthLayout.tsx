import { ChartLine, ListOrdered, NotebookPen } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { paths } from '../../routes/paths'
import { BrandMark } from '../brand/BrandMark'
import { ThemeToggle } from '../ui/ThemeToggle'

const highlights = [
  { icon: NotebookPen, text: 'Simulacros con el puntaje y la penalidad de la UNI y San Marcos' },
  { icon: ListOrdered, text: 'Cada pregunta resuelta paso a paso, con fórmulas y figuras' },
  { icon: ChartLine, text: 'Qué tan cerca estás del último ingresante de tu carrera' },
]

interface AuthLayoutProps {
  title: ReactNode
  subtitle: ReactNode
  footer: ReactNode
  children: ReactNode
}

// Acceso en dos columnas: a la izquierda qué es RumboU (solo en pantallas grandes) y a la
// derecha el formulario.
export function AuthLayout({ title, subtitle, footer, children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen bg-canvas">
      <aside className="relative hidden w-[44%] max-w-xl shrink-0 overflow-hidden bg-chip lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div aria-hidden className="paper-grid absolute inset-0 opacity-70" />
        <Link
          to={paths.home}
          aria-label="Ir a la portada de RumboU"
          className="relative self-start rounded-lg focus-visible:outline-2 focus-visible:outline-accent"
        >
          <BrandMark size="lg" />
        </Link>
        <div className="relative space-y-8">
          <p className="font-display text-3xl leading-tight font-bold tracking-tight text-balance">
            Llega al examen de admisión sabiendo dónde estás y qué te falta.
          </p>
          <ul className="space-y-4">
            {highlights.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3">
                <span className="rounded-lg bg-surface p-2 text-primary shadow-card">
                  <Icon aria-hidden className="size-5" />
                </span>
                <span className="pt-1.5 text-ink-muted">{text}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-sm text-ink-muted">Admisión 2027 · UNI y San Marcos</p>
      </aside>

      <main className="flex flex-1 flex-col">
        <div className="flex items-center justify-between px-4 pt-4 sm:px-8 sm:pt-6">
          <Link
            to={paths.home}
            aria-label="Ir a la portada de RumboU"
            className="rounded-lg focus-visible:outline-2 focus-visible:outline-accent lg:invisible"
          >
            <BrandMark size="sm" />
          </Link>
          <ThemeToggle />
        </div>
        <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
          <div className="w-full max-w-md space-y-7">
            <div className="space-y-2">
              <h1 className="text-[1.75rem] leading-tight font-bold tracking-tight sm:text-3xl">
                {title}
              </h1>
              <p className="text-ink-muted">{subtitle}</p>
            </div>
            {children}
            <p className="text-sm text-ink-muted">{footer}</p>
          </div>
        </div>
      </main>
    </div>
  )
}
