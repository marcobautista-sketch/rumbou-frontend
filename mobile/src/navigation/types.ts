export type RootStackParamList = {
  Login: undefined
  Register: undefined
  ForgotPassword: undefined
  Home: undefined
  Challenge: undefined
  Assistant: undefined
  StudyPlan: { examId?: number } | undefined
  NewExam: undefined
  TakeExam: { examId: number }
  ExamResult: { examId: number }
  ExamHistory: undefined
  Profile: undefined
}
