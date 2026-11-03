import { useLocation } from 'react-router'
import { paths } from '../../routes/paths'
import { AuthLayout } from '../auth/AuthLayout'
import { BrandMark } from '../brand/BrandMark'
import { Page } from '../layout/Page'
import { Skeleton, SkeletonList } from '../ui/Skeleton'
import { ThemeToggle } from '../ui/ThemeToggle'

// Mientras llega el código de una página se dibuja su estructura real, con cajas grises en lugar
// del contenido: así nunca se ve una pantalla vacía y nada salta de lugar al terminar de cargar.

export function PageContentSkeleton() {
  return (
    <Page>
      <div className="space-y-3">
        <Skeleton className="h-8 w-56 max-w-full" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <SkeletonList rows={3} />
    </Page>
  )
}

export function AppShellSkeleton() {
  return (
    <div className="flex min-h-screen bg-canvas">
      <aside
        aria-hidden
        className="sticky top-0 hidden h-screen w-64 shrink-0 space-y-5 border-r border-line bg-surface px-4 pt-5 lg:block"
      >
        <BrandMark />
        <Skeleton className="h-10 w-full" />
        {Array.from({ length: 7 }, (_, index) => (
          <Skeleton key={index} className="h-5 w-full" />
        ))}
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <div
          aria-hidden
          className="flex h-14 items-center border-b border-line bg-surface px-4 sm:px-5 lg:hidden"
        >
          <BrandMark size="sm" />
        </div>
        <PageContentSkeleton />
      </div>
    </div>
  )
}

function AuthPageSkeleton() {
  return (
    <AuthLayout
      title={<Skeleton className="h-9 w-2/3" />}
      subtitle={<Skeleton className="h-4 w-full" />}
      footer={<Skeleton className="h-4 w-1/2" />}
    >
      <div role="status" aria-label="Cargando…" className="space-y-5">
        {Array.from({ length: 2 }, (_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-12 w-full" />
          </div>
        ))}
        <Skeleton className="h-12 w-full" />
      </div>
    </AuthLayout>
  )
}

function LandingSkeleton() {
  return (
    <div className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-30 border-b border-line/70 bg-canvas/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <BrandMark />
          <ThemeToggle />
        </div>
      </header>
      <main className="relative overflow-hidden">
        <div aria-hidden className="paper-grid absolute inset-x-0 top-0 h-[34rem]" />
        <div
          role="status"
          aria-label="Cargando…"
          className="relative mx-auto grid max-w-6xl items-center gap-14 px-4 pt-14 pb-20 sm:px-6 sm:pt-20 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-16 lg:pb-24"
        >
          <div className="space-y-7">
            <Skeleton className="h-8 w-64 max-w-full rounded-full" />
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-4/5" />
            </div>
            <Skeleton className="h-20 w-full max-w-xl" />
            <Skeleton className="h-13 w-56" />
          </div>
          <Skeleton className="h-80 w-full rounded-2xl" />
        </div>
      </main>
    </div>
  )
}

const authRoutes: string[] = [
  paths.login,
  paths.register,
  paths.forgotPassword,
  paths.resetPassword,
]

export function RouteFallback() {
  const { pathname } = useLocation()

  if (pathname === paths.home) return <LandingSkeleton />
  if (authRoutes.includes(pathname)) return <AuthPageSkeleton />
  return <AppShellSkeleton />
}
