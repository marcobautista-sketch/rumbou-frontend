import { Toaster } from 'react-hot-toast'
import { RouterProvider } from 'react-router'
import { ErrorBoundary } from './components/feedback/ErrorBoundary'
import { AuthProvider } from './contexts/AuthProvider'
import { ThemeProvider } from './contexts/ThemeProvider'
import { router } from './routes/router'

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <RouterProvider router={router} />
          <Toaster
            position="top-right"
            toastOptions={{
              className:
                '!rounded-xl !bg-white !text-slate-900 !shadow-lg dark:!bg-slate-800 dark:!text-slate-100',
            }}
          />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
