import { createBrowserRouter } from 'react-router'
import { AppLayout } from '../components/layout/AppLayout'
import RouteErrorPage from '../pages/route-error/RouteErrorPage'
import { GuestRoute } from './GuestRoute'
import {
  AdminUsersPage,
  ExamResultPage,
  ForgotPasswordPage,
  HomePage,
  LoginPage,
  NewExamPage,
  NotFoundPage,
  ProfilePage,
  QuestionDetailPage,
  QuestionFormPage,
  QuestionListPage,
  RegisterPage,
  ResetPasswordPage,
  ReviewPage,
  TakeExamPage,
} from './lazyPages'
import { paths } from './paths'
import { PrivateRoute } from './PrivateRoute'
import { RoleRoute } from './RoleRoute'
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
          {
            element: <AppLayout />,
            children: [
              { path: paths.profile, element: <ProfilePage /> },
              { path: paths.newExam, element: <NewExamPage /> },
              { path: paths.exam, element: <TakeExamPage /> },
              { path: paths.examResult, element: <ExamResultPage /> },
              { path: paths.questions, element: <QuestionListPage /> },
              { path: paths.question, element: <QuestionDetailPage /> },
              {
                element: <RoleRoute roles={['REVIEWER', 'ADMIN']} />,
                children: [{ path: paths.review, element: <ReviewPage /> }],
              },
              {
                element: <RoleRoute roles={['ADMIN']} />,
                children: [
                  { path: paths.newQuestion, element: <QuestionFormPage /> },
                  { path: paths.editQuestion, element: <QuestionFormPage /> },
                  { path: paths.adminUsers, element: <AdminUsersPage /> },
                ],
              },
            ],
          },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
