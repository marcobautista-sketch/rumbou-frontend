import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { LoadingView } from '../components/LoadingView'
import { useAuth } from '../hooks/useAuth'
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen'
import LoginScreen from '../screens/auth/LoginScreen'
import RegisterScreen from '../screens/auth/RegisterScreen'
import ChallengeScreen from '../screens/ChallengeScreen'
import WelcomeScreen from '../screens/WelcomeScreen'
import type { RootStackParamList } from './types'

const Stack = createNativeStackNavigator<RootStackParamList>()

export function RootNavigator() {
  const { status } = useAuth()

  if (status === 'loading') return <LoadingView />

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {status === 'authenticated' ? (
        <>
          <Stack.Screen name="Home" component={WelcomeScreen} />
          <Stack.Screen
            name="Challenge"
            component={ChallengeScreen}
            options={{ headerShown: true, title: 'Desafío diario' }}
          />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </>
      )}
    </Stack.Navigator>
  )
}
