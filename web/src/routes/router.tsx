import { createBrowserRouter } from 'react-router'
import RouteErrorPage from '../pages/route-error/RouteErrorPage'
import { GuestRoute } from './GuestRoute'
import {
  ExamResultPage,
  ForgotPasswordPage,
  HomePage,
  LoginPage,
  NewExamPage,
  NotFoundPage,
  ProfilePage,
  RegisterPage,
  ResetPasswordPage,
  TakeExamPage,
} from './lazyPages'
import { paths } from './paths'
import { PrivateRoute } from './PrivateRoute'
import { RootLayout } from './RootLayout'

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      { path: paths.home, element: <HomePage /> },
      { path: paths.resetPassword, element: <ResetPasswordPage /> },
      {
        element: <GuestRoute />,
        children: [
          { path: paths.login, element: <LoginPage /> },
          { path: paths.register, element: <RegisterPage /> },
          { path: paths.forgotPassword, element: <ForgotPasswordPage /> },
        ],
      },
      {
        element: <PrivateRoute />,
        children: [
          { path: paths.profile, element: <ProfilePage /> },
          { path: paths.newExam, element: <NewExamPage /> },
          { path: paths.exam, element: <TakeExamPage /> },
          { path: paths.examResult, element: <ExamResultPage /> },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
