import { MaterialCommunityIcons } from '@expo/vector-icons'
import { NavigationContainer } from '@react-navigation/native'
import { StatusBar } from 'expo-status-bar'
import type { ComponentProps } from 'react'
import { useColorScheme } from 'react-native'
import { PaperProvider } from 'react-native-paper'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'
import { OfflineBanner } from './src/components/OfflineBanner'
import { AuthProvider } from './src/contexts/AuthProvider'
import { RootNavigator } from './src/navigation/RootNavigator'
import { navigationThemes } from './src/theme/navigationTheme'
import { paperThemes } from './src/theme/paperTheme'
import { toastConfig } from './src/utils/toastConfig'

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name']

// Los íconos de React Native Paper salen de @expo/vector-icons, que Expo ya incluye.
const paperSettings = {
  icon: ({ name, color, size }: { name: string; color?: string; size: number }) => (
    <MaterialCommunityIcons name={name as IconName} color={color} size={size} />
  ),
}

export default function App() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light'

  return (
    <SafeAreaProvider>
      <PaperProvider theme={paperThemes[scheme]} settings={paperSettings}>
        <OfflineBanner />
        <AuthProvider>
          <NavigationContainer theme={navigationThemes[scheme]}>
            <RootNavigator />
          </NavigationContainer>
          <Toast config={toastConfig} />
        </AuthProvider>
        <StatusBar style="auto" />
      </PaperProvider>
    </SafeAreaProvider>
  )
}
