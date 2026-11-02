import type { ReactNode } from 'react'

interface PageProps {
  children: ReactNode
  className?: string
}

// Contenedor común de las páginas con menú: mismo ancho y márgenes en todas, para que el
// contenido no salte de lugar al cambiar de sección.
export function Page({ children, className = '' }: PageProps) {
  return (
    <main
      className={`mx-auto w-full max-w-6xl space-y-8 px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10 ${className}`}
    >
      {children}
    </main>
  )
}
