import { Suspense } from 'react'
import { Outlet } from 'react-router'
import { PageLoader } from '../components/feedback/PageLoader'

export function RootLayout() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Outlet />
    </Suspense>
  )
}
