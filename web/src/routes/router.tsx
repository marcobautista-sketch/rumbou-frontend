import { createBrowserRouter } from 'react-router'
import RouteErrorPage from '../pages/route-error/RouteErrorPage'
import { GuestRoute } from './GuestRoute'
import { HomePage, LoginPage, NotFoundPage, RegisterPage } from './lazyPages'
import { paths } from './paths'
import { RootLayout } from './RootLayout'

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      { path: paths.home, element: <HomePage /> },
      {
        element: <GuestRoute />,
        children: [
          { path: paths.login, element: <LoginPage /> },
          { path: paths.register, element: <RegisterPage /> },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
