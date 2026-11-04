import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  ChartLine,
  Check,
  Crown,
  Flame,
  ListOrdered,
  NotebookPen,
  PenLine,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'
import { useCallback, type ReactNode } from 'react'
import { Link } from 'react-router'
import { offerService } from '../../api/offerService'
import { BrandMark } from '../../components/brand/BrandMark'
import { CareerLookup } from '../../components/landing/CareerLookup'
import { HeroPreview } from '../../components/landing/HeroPreview'
import { SampleQuestion } from '../../components/landing/SampleQuestion'
import { ScoringRules } from '../../components/landing/ScoringRules'
import { buttonStyles } from '../../components/ui/buttonStyles'
import { ThemeToggle } from '../../components/ui/ThemeToggle'
import { useAuth } from '../../hooks/useAuth'
import { useFetch } from '../../hooks/useFetch'
import { paths } from '../../routes/paths'
import { freePlanBenefits, PRO_PRICE, proPlanBenefits } from '../../utils/plans'

const sections = [
  { id: 'pruebalo', label: 'Pruébalo' },
  { id: 'calificacion', label: 'Calificación' },
  { id: 'como-funciona', label: 'Cómo funciona' },
  { id: 'planes', label: 'Planes' },
]

// Cada paso trae lo que RumboU ofrece en ese momento, para no repetirlo en otra sección.
const steps: { title: string; text: string; tools: { icon: LucideIcon; text: string }[] }[] = [
  {
    title: 'Elige tu carrera',
    text: 'Te mostramos el puntaje del último ingresante y las vacantes de la carrera a la que postulas.',
    tools: [
      { icon: ChartLine, text: 'Tu puntaje proyectado frente a tu meta' },
      { icon: CalendarDays, text: 'Los días que faltan para tu examen' },
    ],
  },
  {
    title: 'Rinde tu diagnóstico',
    text: 'Un simulacro completo mide tu punto de partida y tu dominio de cada tema.',
    tools: [
      { icon: NotebookPen, text: 'Simulacros por tema o completos' },
      { icon: ListOrdered, text: 'Resolución paso a paso, con fórmulas y figuras' },
      { icon: PenLine, text: 'Pizarra para resolver con el dedo o un lápiz' },
    ],
  },
  {
    title: 'Practica lo que te falta',
    text: 'Refuerza tus temas más débiles y mide tu avance en tu siguiente simulacro completo.',
    tools: [
      { icon: Flame, text: 'Desafío diario, racha y logros' },
      { icon: BookOpen, text: 'Plan de estudio con videos y libros' },
      { icon: Sparkles, text: 'Tutor con IA que explica tus errores (plan PRO)' },
    ],
  },
]

const plans = [
  {
    name: 'Gratuito',
    price: 'S/ 0',
    period: 'para siempre',
    description: 'Para empezar a prepararte.',
    benefits: freePlanBenefits,
  },
  {
    name: 'PRO',
    price: PRO_PRICE,
    period: 'al mes',
    description: 'Para prepararte sin límites.',
    benefits: proPlanBenefits,
  },
]

function Section({
  id,
  eyebrow,
  title,
  description,
  split = false,
  children,
}: {
  id?: string
  eyebrow: string
  title: string
  description?: string
  // En pantallas grandes, el título queda fijo a un lado del contenido.
  split?: boolean
  children: ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-16 py-16 sm:py-20">
      <div
        className={`mx-auto max-w-6xl px-4 sm:px-6 ${
          split
            ? 'lg:grid lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:items-start lg:gap-12'
            : ''
        }`}
      >
        <div className={`max-w-2xl space-y-3 ${split ? 'lg:sticky lg:top-24' : ''}`}>
          <p className="text-sm font-semibold tracking-wider text-primary uppercase">{eyebrow}</p>
          <h2 className="text-3xl leading-tight font-bold tracking-tight text-balance sm:text-4xl">
            {title}
          </h2>
          {description && <p className="text-lg text-pretty text-ink-muted">{description}</p>}
        </div>
        <div className={split ? 'mt-10 lg:mt-0' : 'mt-10'}>{children}</div>
      </div>
    </section>
  )
}

export default function HomePage() {
  const { user } = useAuth()
  const fetchOffers = useCallback((signal: AbortSignal) => offerService.search({}, signal), [])
  const offers = useFetch(fetchOffers)

  const facts = [
    { value: '2', label: 'universidades', detail: 'UNI y San Marcos' },
    {
      value: offers.data ? String(offers.data.length) : '70',
      label: 'carreras',
      detail: 'con su último ingresante',
    },
    { value: '792', label: 'preguntas propias', detail: 'resueltas paso a paso' },
    { value: '22', label: 'temas', detail: 'del temario de admisión' },
  ]

  const primaryCta = user ? (
    <Link to={paths.dashboard} className={buttonStyles('primary', 'lg')}>
      Ir a mi panel
      <ArrowRight aria-hidden className="size-5" />
    </Link>
  ) : (
    <Link to={paths.register} className={buttonStyles('primary', 'lg')}>
      Crear cuenta gratis
      <ArrowRight aria-hidden className="size-5" />
    </Link>
  )

  return (
    <div className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-30 border-b border-line/70 bg-canvas/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link
            to={paths.home}
            aria-label="RumboU, portada"
            className="rounded-lg focus-visible:outline-2 focus-visible:outline-accent"
          >
            <BrandMark />
          </Link>
          <nav aria-label="Secciones" className="hidden items-center gap-1 md:flex">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="rounded-lg px-3 py-2 text-sm font-medium text-ink-muted transition hover:bg-surface-muted hover:text-ink"
              >
                {section.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-1 sm:gap-2">
            <ThemeToggle />
            {user ? (
              <Link to={paths.dashboard} className={buttonStyles('primary', 'sm')}>
                Mi panel
              </Link>
            ) : (
              <>
                <span className="hidden sm:block">
                  <Link to={paths.login} className={buttonStyles('ghost', 'sm')}>
                    Iniciar sesión
                  </Link>
                </span>
                <Link
                  to={paths.register}
                  className={`${buttonStyles('primary', 'sm')} whitespace-nowrap`}
                >
                  Crear cuenta
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div aria-hidden className="paper-grid absolute inset-x-0 top-0 h-[34rem]" />
          <div className="relative mx-auto grid grid-cols-1 max-w-6xl items-center gap-14 px-4 pt-14 pb-20 sm:px-6 sm:pt-20 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-16 lg:pb-24">
            <div className="space-y-7">
              <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-sm font-medium text-ink-muted shadow-card">
                <span className="size-2 rounded-full bg-accent" />
                Admisión 2027 · UNI y San Marcos
              </p>
              <h1 className="text-4xl leading-[1.08] font-extrabold tracking-tight text-balance sm:text-5xl lg:text-[3.15rem]">
                Simulacros de admisión que se califican{' '}
                <span className="text-primary">como el examen real</span>.
              </h1>
              <p className="max-w-xl text-lg text-pretty text-ink-muted sm:text-xl">
                RumboU replica el puntaje y la penalidad de cada universidad, explica cada pregunta
                paso a paso y te dice qué tan cerca estás del último ingresante de tu carrera.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                {primaryCta}
                <a href="#pruebalo" className={buttonStyles('secondary', 'lg')}>
                  Probar una pregunta
                </a>
              </div>
              <p className="text-sm text-ink-muted">
                Gratis para empezar · En la web y Android
                {!user && (
                  <>
                    {' · '}
                    <Link to={paths.login} className="font-semibold text-primary hover:underline">
                      Ya tengo cuenta
                    </Link>
                  </>
                )}
              </p>
            </div>
            <HeroPreview />
          </div>
        </section>

        <section aria-label="RumboU en cifras" className="border-y border-line bg-surface">
          <dl className="mx-auto grid max-w-6xl grid-cols-2 gap-y-8 px-4 py-10 sm:px-6 lg:grid-cols-4">
            {facts.map((fact) => (
              <div
                key={fact.label}
                className="space-y-1 px-2 lg:border-l lg:border-line lg:px-8 lg:first:border-0 lg:first:pl-0"
              >
                <dt className="sr-only">{fact.label}</dt>
                <dd className="font-display text-4xl font-bold tracking-tight text-primary tabular-nums">
                  {fact.value}
                </dd>
                <dd className="font-semibold">{fact.label}</dd>
                <dd className="text-sm text-ink-muted">{fact.detail}</dd>
              </div>
            ))}
          </dl>
        </section>

        <Section
          id="pruebalo"
          split
          eyebrow="Pruébalo"
          title="Resuelve una pregunta ahora"
          description="No necesitas cuenta. Elige una alternativa y comprueba tu respuesta: verás la resolución completa, igual que al terminar un simulacro."
        >
          <SampleQuestion />
        </Section>

        <div className="border-y border-line bg-surface-muted/60">
          <Section
            id="calificacion"
            eyebrow="Calificación"
            title="El mismo puntaje y la misma penalidad que el examen"
            description="Cada respuesta incorrecta resta lo que resta en tu universidad y las que dejas en blanco no cuentan. Así tu puntaje proyectado se compara de verdad con el del último ingresante."
          >
            <ScoringRules />
            <p className="mt-4 text-sm text-ink-muted">
              Fuente: prospectos de admisión de la UNI y de San Marcos.
            </p>
          </Section>
        </div>

        <Section
          id="carreras"
          eyebrow="Tu meta"
          title="¿Cuánto necesitas para ingresar?"
          description="Elige tu carrera y mira el puntaje del último ingresante del proceso 2026-II."
        >
          <CareerLookup offers={offers.data} failed={Boolean(offers.error)} />
        </Section>

        <div className="border-y border-line bg-surface-muted/60">
          <Section
            id="como-funciona"
            eyebrow="Cómo funciona"
            title="Un camino claro desde el primer día"
            description="Sabes a qué carrera postulas, dónde estás hoy y qué practicar para llegar."
          >
            <ol className="grid grid-cols-1 gap-5 lg:grid-cols-3">
              {steps.map((step, index) => (
                <li
                  key={step.title}
                  className="flex flex-col rounded-2xl border border-line bg-surface p-6 shadow-card"
                >
                  <span className="flex size-10 items-center justify-center rounded-full bg-primary font-display text-lg font-bold text-on-primary">
                    {index + 1}
                  </span>
                  <h3 className="mt-5 text-lg font-bold">{step.title}</h3>
                  <p className="mt-2 text-ink-muted">{step.text}</p>
                  <ul className="mt-5 space-y-3 border-t border-line pt-5">
                    {step.tools.map(({ icon: Icon, text }) => (
                      <li key={text} className="flex items-start gap-3 text-sm">
                        <Icon aria-hidden className="mt-0.5 size-5 shrink-0 text-primary" />
                        {text}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </Section>
        </div>

        <Section
          id="planes"
          eyebrow="Planes"
          title="Empieza gratis y pasa a PRO cuando lo necesites"
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {plans.map((plan) => {
              const pro = plan.name === 'PRO'
              return (
                <article
                  key={plan.name}
                  className={`flex flex-col rounded-2xl border bg-surface p-6 shadow-card sm:p-8 ${
                    pro ? 'border-primary ring-1 ring-primary' : 'border-line'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="flex items-center gap-2 text-xl font-bold">
                      {pro && <Crown aria-hidden className="size-5 text-warning" />}
                      {plan.name}
                    </h3>
                    {pro && (
                      <span className="rounded-full bg-chip px-2.5 py-0.5 text-xs font-semibold text-primary">
                        Recomendado
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-ink-muted">{plan.description}</p>
                  <p className="mt-5 flex items-baseline gap-2">
                    <span className="font-display text-4xl font-bold tracking-tight">
                      {plan.price}
                    </span>
                    <span className="text-ink-muted">{plan.period}</span>
                  </p>
                  <ul className="mt-6 flex-1 space-y-3">
                    {plan.benefits.map((benefit) => (
                      <li key={benefit} className="flex items-start gap-3">
                        <Check aria-hidden className="mt-0.5 size-5 shrink-0 text-success" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                  {!user && (
                    <Link
                      to={paths.register}
                      className={`${buttonStyles(pro ? 'primary' : 'secondary')} mt-8 w-full`}
                    >
                      {pro ? 'Crear cuenta y pasar a PRO' : 'Crear cuenta gratis'}
                    </Link>
                  )}
                </article>
              )
            })}
          </div>
        </Section>

        <section className="px-4 pb-20 sm:px-6">
          <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-primary px-6 py-14 text-center text-on-primary sm:px-12">
            <div className="mx-auto max-w-2xl space-y-4">
              <h2 className="text-3xl leading-tight font-bold tracking-tight text-balance sm:text-4xl">
                Empieza por tu diagnóstico
              </h2>
              <p className="text-lg opacity-90">
                Crea tu cuenta, elige tu carrera y descubre tu punto de partida tema por tema.
              </p>
              <Link
                to={user ? paths.dashboard : paths.register}
                className="mt-4 inline-flex min-h-13 items-center justify-center gap-2 rounded-xl bg-on-primary px-6 py-3 text-lg font-semibold text-primary transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-primary"
              >
                {user ? 'Ir a mi panel' : 'Crear cuenta gratis'}
                <ArrowRight aria-hidden className="size-5" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line bg-surface">
        <div className="mx-auto grid grid-cols-1 max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[minmax(0,1fr)_auto]">
          <div className="max-w-xl space-y-3">
            <BrandMark size="sm" />
            <p className="text-sm text-ink-muted">
              RumboU es un proyecto independiente y no está afiliado a la Universidad Nacional de
              Ingeniería ni a la Universidad Nacional Mayor de San Marcos. Las preguntas son de
              elaboración propia y siguen el temario de admisión de cada universidad; los puntajes
              del último ingresante provienen de sus resultados oficiales del proceso 2026-II.
            </p>
          </div>
          <nav aria-label="Cuenta" className="flex flex-wrap gap-x-6 gap-y-2 text-sm md:flex-col">
            <Link to={paths.login} className="font-medium text-ink-muted hover:text-ink">
              Iniciar sesión
            </Link>
            <Link to={paths.register} className="font-medium text-ink-muted hover:text-ink">
              Crear cuenta
            </Link>
          </nav>
        </div>
        <p className="border-t border-line py-5 text-center text-sm text-ink-muted">
          © 2026 RumboU · Lima, Perú
        </p>
      </footer>
    </div>
  )
}
