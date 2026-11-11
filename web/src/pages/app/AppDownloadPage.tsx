import { Download, Globe, QrCode, Smartphone } from 'lucide-react'
import { Link } from 'react-router'
import { BrandMark } from '../../components/brand/BrandMark'
import { buttonStyles } from '../../components/ui/buttonStyles'
import { ThemeToggle } from '../../components/ui/ThemeToggle'
import { useAuth } from '../../hooks/useAuth'
import { paths } from '../../routes/paths'

export const APK_URL =
  'https://github.com/marcobautista-sketch/rumbou-frontend/releases/download/v1.1.0/rumbou-1.1.0.apk'
const PAGE_URL = 'https://rumbou-frontend.vercel.app/app'

type Platform = 'android' | 'ios' | 'other'

// El navegador dice desde qué celular se abrió la página: así cada persona ve solo su camino.
function detectPlatform(): Platform {
  const agent = navigator.userAgent
  if (/android/i.test(agent)) return 'android'
  if (/iphone|ipad|ipod/i.test(agent)) return 'ios'
  return 'other'
}

function Step({ number, children }: { number: number; children: string }) {
  return (
    <li className="flex gap-3">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-chip text-sm font-bold text-primary">
        {number}
      </span>
      <span className="text-ink-muted">{children}</span>
    </li>
  )
}

function AndroidGuide({ webPath }: { webPath: string }) {
  return (
    <section className="space-y-5 rounded-2xl bg-surface p-6 shadow-card">
      <div className="flex items-center gap-3">
        <Smartphone aria-hidden className="size-6 text-primary" />
        <h2 className="text-xl font-semibold">Instala la app en tu Android</h2>
      </div>
      <a href={APK_URL} className={`${buttonStyles('primary', 'lg')} w-full`}>
        <Download aria-hidden className="size-5" />
        Descargar la app (APK, 91 MB)
      </a>
      <ol className="space-y-3">
        <Step number={1}>Toca Descargar y espera a que termine.</Step>
        <Step number={2}>
          Abre el archivo y acepta instalar; Android puede pedirte permiso para esta fuente.
        </Step>
        <Step number={3}>Abre RumboU, crea tu cuenta y elige tu carrera meta.</Step>
      </ol>
      <p className="text-sm text-ink-muted">
        ¿Prefieres no instalar nada?{' '}
        <Link to={webPath} className="font-semibold text-primary hover:underline">
          Usa la versión web
        </Link>
        , que funciona en el navegador de tu celular.
      </p>
    </section>
  )
}

function IosGuide({ webPath }: { webPath: string }) {
  return (
    <section className="space-y-5 rounded-2xl bg-surface p-6 shadow-card">
      <div className="flex items-center gap-3">
        <Globe aria-hidden className="size-6 text-primary" />
        <h2 className="text-xl font-semibold">Prueba RumboU en tu iPhone</h2>
      </div>
      <p className="text-ink-muted">
        En iPhone se usa la versión web: tiene los simulacros, el progreso, la liga semanal y el
        banco de preguntas, sin instalar nada.
      </p>
      <Link to={webPath} className={`${buttonStyles('primary', 'lg')} w-full`}>
        Abrir RumboU
      </Link>
      <p className="text-sm text-ink-muted">
        La app nativa para iPhone se distribuye con Expo Go a los miembros del proyecto; en la
        presentación la verás en vivo. Si quieres probarla en tu iPhone, pídenos acceso.
      </p>
    </section>
  )
}

function DesktopGuide({ webPath }: { webPath: string }) {
  return (
    <section className="grid gap-6 rounded-2xl bg-surface p-6 shadow-card sm:grid-cols-[auto_1fr] sm:items-center">
      <img
        src="/qr-app.svg"
        alt={`Código QR que abre ${PAGE_URL}`}
        width={200}
        height={200}
        className="mx-auto rounded-xl bg-white p-2"
      />
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <QrCode aria-hidden className="size-6 text-primary" />
          <h2 className="text-xl font-semibold">Escanea con tu celular</h2>
        </div>
        <p className="text-ink-muted">
          Abre la cámara, apunta al código y toca el enlace. Esta misma página te mostrará cómo
          seguir según tu celular: en Android instalas la app y en iPhone usas la versión web.
        </p>
        <div className="flex flex-wrap gap-3">
          <a href={APK_URL} className={buttonStyles('secondary')}>
            <Download aria-hidden className="size-4" />
            APK para Android
          </a>
          <Link to={webPath} className={buttonStyles('secondary')}>
            <Globe aria-hidden className="size-4" />
            Versión web
          </Link>
        </div>
      </div>
    </section>
  )
}

// Página pública a la que lleva el QR de la presentación: cada persona ve cómo probar RumboU
// desde su propio celular.
export default function AppDownloadPage() {
  const { status } = useAuth()
  const platform = detectPlatform()
  const webPath = status === 'authenticated' ? paths.dashboard : paths.register

  return (
    <div className="min-h-dvh bg-canvas">
      <header className="border-b border-line bg-surface/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link to={paths.home} aria-label="Ir a la portada de RumboU">
            <BrandMark />
          </Link>
          <ThemeToggle />
        </div>
      </header>
      <main className="mx-auto max-w-3xl space-y-8 px-4 py-10 sm:px-6">
        <div className="space-y-2">
          <h1 className="font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            RumboU en tu celular
          </h1>
          <p className="text-pretty text-ink-muted">
            Simulacros con las reglas reales de la UNI y San Marcos, tu progreso frente al último
            ingresante y una liga semanal para no perder el ritmo.
          </p>
        </div>
        {platform === 'android' && <AndroidGuide webPath={webPath} />}
        {platform === 'ios' && <IosGuide webPath={webPath} />}
        {platform === 'other' && <DesktopGuide webPath={webPath} />}
        <p className="text-center text-sm text-ink-muted">
          RumboU es un proyecto del curso CS 2031 de UTEC y no está afiliado a ninguna universidad.
        </p>
      </main>
    </div>
  )
}
