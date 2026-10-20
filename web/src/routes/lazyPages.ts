import { lazy } from 'react'

export const HomePage = lazy(() => import('../pages/home/HomePage'))
export const LoginPage = lazy(() => import('../pages/auth/LoginPage'))
export const RegisterPage = lazy(() => import('../pages/auth/RegisterPage'))
export const ForgotPasswordPage = lazy(() => import('../pages/auth/ForgotPasswordPage'))
export const ResetPasswordPage = lazy(() => import('../pages/auth/ResetPasswordPage'))
export const ProfilePage = lazy(() => import('../pages/profile/ProfilePage'))
export const NewExamPage = lazy(() => import('../pages/exams/NewExamPage'))
export const TakeExamPage = lazy(() => import('../pages/exams/TakeExamPage'))
export const ExamResultPage = lazy(() => import('../pages/exams/ExamResultPage'))
export const NotFoundPage = lazy(() => import('../pages/not-found/NotFoundPage'))
