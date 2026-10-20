import { Suspense, type ReactNode } from 'react'
import { createBrowserRouter } from 'react-router'
import { HomePage, NotFoundPage } from './lazyPages'
import { paths } from './paths'

function withSuspense(page: ReactNode) {
  return <Suspense fallback={null}>{page}</Suspense>
}

export const router = createBrowserRouter([
  { path: paths.home, element: withSuspense(<HomePage />) },
  { path: '*', element: withSuspense(<NotFoundPage />) },
])
