import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native'
import { StatusBar } from 'expo-status-bar'
import { useColorScheme } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'
import { OfflineBanner } from './src/components/OfflineBanner'
import { AuthProvider } from './src/contexts/AuthProvider'
import { RootNavigator } from './src/navigation/RootNavigator'
import { toastConfig } from './src/utils/toastConfig'

export default function App() {
  const colorScheme = useColorScheme()

  return (
    <SafeAreaProvider>
      <OfflineBanner />
      <AuthProvider>
        <NavigationContainer theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <RootNavigator />
        </NavigationContainer>
        <Toast config={toastConfig} />
      </AuthProvider>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  )
}
