import { lazy } from 'react'

const loadHomePage = () => import('../pages/home/HomePage')
const loadLoginPage = () => import('../pages/auth/LoginPage')
const loadRegisterPage = () => import('../pages/auth/RegisterPage')

// Portada, login y registro se descargan apenas el navegador queda libre, para que moverse entre
// ellas sea inmediato.
export function preloadPublicPages() {
  const preload = () =>
    [loadHomePage, loadLoginPage, loadRegisterPage].forEach((load) => void load())
  if ('requestIdleCallback' in window) {
    const id = requestIdleCallback(preload)
    return () => cancelIdleCallback(id)
  }
  const timer = setTimeout(preload, 500)
  return () => clearTimeout(timer)
}

export const HomePage = lazy(loadHomePage)
export const LoginPage = lazy(loadLoginPage)
export const RegisterPage = lazy(loadRegisterPage)
export const ForgotPasswordPage = lazy(() => import('../pages/auth/ForgotPasswordPage'))
export const ResetPasswordPage = lazy(() => import('../pages/auth/ResetPasswordPage'))
export const ProfilePage = lazy(() => import('../pages/profile/ProfilePage'))
export const DashboardPage = lazy(() => import('../pages/dashboard/DashboardPage'))
export const ProgressPage = lazy(() => import('../pages/progress/ProgressPage'))
export const CareersPage = lazy(() => import('../pages/careers/CareersPage'))
export const AchievementsPage = lazy(() => import('../pages/achievements/AchievementsPage'))
export const ExamHistoryPage = lazy(() => import('../pages/exams/ExamHistoryPage'))
export const NewExamPage = lazy(() => import('../pages/exams/NewExamPage'))
export const TakeExamPage = lazy(() => import('../pages/exams/TakeExamPage'))
export const ExamResultPage = lazy(() => import('../pages/exams/ExamResultPage'))
export const ChallengePage = lazy(() => import('../pages/challenge/ChallengePage'))
export const NotFoundPage = lazy(() => import('../pages/not-found/NotFoundPage'))
export const QuestionListPage = lazy(() => import('../pages/questions/QuestionListPage'))
export const QuestionDetailPage = lazy(() => import('../pages/questions/QuestionDetailPage'))
export const QuestionFormPage = lazy(() => import('../pages/questions/QuestionFormPage'))
export const ReviewPage = lazy(() => import('../pages/review/ReviewPage'))
export const AdminUsersPage = lazy(() => import('../pages/admin/AdminUsersPage'))
