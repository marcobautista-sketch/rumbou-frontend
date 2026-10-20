import { Suspense, type ReactNode } from 'react'
import { createBrowserRouter } from 'react-router'
import { PageLoader } from '../components/feedback/PageLoader'
import RouteErrorPage from '../pages/route-error/RouteErrorPage'
import { HomePage, NotFoundPage } from './lazyPages'
import { paths } from './paths'

function withSuspense(page: ReactNode) {
  return <Suspense fallback={<PageLoader />}>{page}</Suspense>
}

export const router = createBrowserRouter([
  {
    errorElement: <RouteErrorPage />,
    children: [
      { path: paths.home, element: withSuspense(<HomePage />) },
      { path: '*', element: withSuspense(<NotFoundPage />) },
    ],
  },
])
