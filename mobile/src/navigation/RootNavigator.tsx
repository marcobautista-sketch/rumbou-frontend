import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { LoadingView } from '../components/LoadingView'
import { useColors } from '../theme/useColors'
import { useAuth } from '../hooks/useAuth'
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen'
import LoginScreen from '../screens/auth/LoginScreen'
import RegisterScreen from '../screens/auth/RegisterScreen'
import ExamResultScreen from '../screens/exams/ExamResultScreen'
import NewExamScreen from '../screens/exams/NewExamScreen'
import TakeExamScreen from '../screens/exams/TakeExamScreen'
import StudyPlanScreen from '../screens/StudyPlanScreen'
import { MainTabs } from './MainTabs'
import type { RootStackParamList } from './types'

const Stack = createNativeStackNavigator<RootStackParamList>()

export function RootNavigator() {
  const { status } = useAuth()
  const colors = useColors()

  if (status === 'loading') return <LoadingView />

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        headerStyle: { backgroundColor: colors.background },
        headerShadowVisible: false,
        headerTintColor: colors.primary,
        headerTitleStyle: { fontWeight: '700', color: colors.text },
        headerBackTitle: 'Atrás',
      }}
    >
      {status === 'authenticated' ? (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen
            name="StudyPlan"
            component={StudyPlanScreen}
            options={{ headerShown: true, title: 'Plan de estudio' }}
          />
          <Stack.Screen
            name="NewExam"
            component={NewExamScreen}
            options={{ headerShown: true, title: 'Nuevo simulacro' }}
          />
          <Stack.Screen
            name="TakeExam"
            component={TakeExamScreen}
            options={{ headerShown: true, title: 'Simulacro' }}
          />
          <Stack.Screen
            name="ExamResult"
            component={ExamResultScreen}
            options={{ headerShown: true, title: 'Tu resultado' }}
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
