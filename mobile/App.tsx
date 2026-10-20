import { StatusBar } from 'expo-status-bar'
import { AuthProvider } from './src/contexts/AuthProvider'
import WelcomeScreen from './src/screens/WelcomeScreen'

export default function App() {
  return (
    <AuthProvider>
      <WelcomeScreen />
      <StatusBar style="auto" />
    </AuthProvider>
  )
}
