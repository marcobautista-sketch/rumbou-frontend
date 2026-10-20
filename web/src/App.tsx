import { Toaster } from 'react-hot-toast'
import { RouterProvider } from 'react-router'
import { ErrorBoundary } from './components/feedback/ErrorBoundary'
import { AuthProvider } from './contexts/AuthProvider'
import { router } from './routes/router'

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <RouterProvider router={router} />
        <Toaster position="top-right" />
      </AuthProvider>
    </ErrorBoundary>
  )
}
