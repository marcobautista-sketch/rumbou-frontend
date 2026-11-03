import { Apple, ExternalLink, Smartphone } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { androidApkUrl, expoGoLink, expoGoStores } from '../../utils/mobileApp'
import { buttonStyles } from '../ui/buttonStyles'

const steps = androidApkUrl
  ? [
      'En Android, descarga la app. En iPhone, instala Expo Go.',
      'En iPhone, escanea el código con la cámara o toca “Abrir en Expo Go”.',
      'Entra con tu misma cuenta y sigue donde lo dejaste.',
    ]
  : [
      'Instala Expo Go, la app gratuita que abre RumboU en tu celular.',
      'Escanea el código: en iPhone con la cámara y en Android desde Expo Go.',
      'Entra con tu misma cuenta y sigue donde lo dejaste.',
    ]

export function MobileAppDownload() {
  return (
    <div className="grid items-center gap-8 rounded-2xl border border-line bg-surface p-6 shadow-card sm:p-8 md:grid-cols-[minmax(0,1fr)_auto] md:gap-12">
      <div className="space-y-6">
        <ol className="space-y-3">
          {steps.map((step, index) => (
            <li key={step} className="flex items-start gap-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-chip text-sm font-bold text-primary">
                {index + 1}
              </span>
              <span className="pt-0.5 text-ink-muted">{step}</span>
            </li>
          ))}
        </ol>
        <div className="flex flex-wrap gap-3">
          <a
            href={androidApkUrl ?? expoGoStores.android}
            {...(androidApkUrl ? {} : { target: '_blank', rel: 'noreferrer' })}
            className={`${buttonStyles('primary', 'md')} gap-2`}
          >
            <Smartphone aria-hidden className="size-5" />
            {androidApkUrl ? 'Descargar APK para Android' : 'Expo Go para Android'}
          </a>
          <a
            href={expoGoStores.ios}
            target="_blank"
            rel="noreferrer"
            className={`${buttonStyles('secondary', 'md')} gap-2`}
          >
            <Apple aria-hidden className="size-5" />
            Expo Go para iPhone
          </a>
          <a href={expoGoLink} className={`${buttonStyles('ghost', 'md')} gap-2 md:hidden`}>
            <ExternalLink aria-hidden className="size-5" />
            Abrir en Expo Go
          </a>
        </div>
      </div>
      <figure className="hidden flex-col items-center gap-3 md:flex">
        {/* Fondo blanco fijo: en modo oscuro los lectores de QR no leerían un código invertido. */}
        <div className="rounded-xl bg-white p-3 shadow-card">
          <QRCodeSVG
            value={expoGoLink}
            size={168}
            fgColor="#1e2430"
            title="Código QR para abrir RumboU en Expo Go"
          />
        </div>
        <figcaption className="text-sm text-ink-muted">Abre RumboU en Expo Go</figcaption>
      </figure>
    </div>
  )
}
