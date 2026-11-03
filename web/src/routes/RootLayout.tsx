import { Suspense, useEffect } from 'react'
import { Outlet } from 'react-router'
import { RouteFallback } from '../components/feedback/RouteSkeletons'
import { preloadPublicPages } from './lazyPages'

export function RootLayout() {
  useEffect(preloadPublicPages, [])

  return (
    <Suspense fallback={<RouteFallback />}>
      <Outlet />
    </Suspense>
  )
}
