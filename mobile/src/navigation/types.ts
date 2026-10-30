import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'

// Las pestañas de abajo, una vez que el usuario inició sesión.
export type MainTabParamList = {
  Home: undefined
  ExamHistory: undefined
  Goals: undefined
  Challenge: undefined
  Profile: undefined
}

export type RootStackParamList = {
  Login: undefined
  Register: undefined
  ForgotPassword: undefined
  Main: NavigatorScreenParams<MainTabParamList> | undefined
  Assistant: undefined
  StudyPlan: { examId?: number } | undefined
  NewExam: undefined
  TakeExam: { examId: number }
  ExamResult: { examId: number }
}

// Una pestaña puede navegar a sus hermanas y también a las pantallas del stack que la contiene.
export type MainTabScreenProps<T extends keyof MainTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, T>,
  NativeStackScreenProps<RootStackParamList>
>
