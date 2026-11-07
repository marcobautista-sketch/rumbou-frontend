import { MaterialCommunityIcons } from '@expo/vector-icons'
import { NavigationContainer } from '@react-navigation/native'
import { StatusBar } from 'expo-status-bar'
import { useContext, useMemo, type ComponentProps } from 'react'
import { useColorScheme } from 'react-native'
import { PaperProvider } from 'react-native-paper'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'
import { OfflineBanner } from './src/components/OfflineBanner'
import { AuthProvider } from './src/contexts/AuthProvider'
import { UniversityContext } from './src/contexts/UniversityContext'
import { UniversityProvider } from './src/contexts/UniversityProvider'
import { RootNavigator } from './src/navigation/RootNavigator'
import { navigationThemeFor } from './src/theme/navigationTheme'
import { paperThemeFor } from './src/theme/paperTheme'
import { toastConfig } from './src/utils/toastConfig'

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name']

// Los íconos de React Native Paper salen de @expo/vector-icons, que Expo ya incluye.
const paperSettings = {
  icon: ({ name, color, size }: { name: string; color?: string; size: number }) => (
    <MaterialCommunityIcons name={name as IconName} color={color} size={size} />
  ),
}

function ThemedApp() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light'
  const university = useContext(UniversityContext)
  const paperTheme = useMemo(() => paperThemeFor(scheme, university), [scheme, university])
  const navigationTheme = useMemo(
    () => navigationThemeFor(scheme, university),
    [scheme, university],
  )

  return (
    <PaperProvider theme={paperTheme} settings={paperSettings}>
      <OfflineBanner />
      <NavigationContainer theme={navigationTheme}>
        <RootNavigator />
      </NavigationContainer>
      <Toast config={toastConfig} />
      <StatusBar style="auto" />
    </PaperProvider>
  )
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <UniversityProvider>
          <ThemedApp />
        </UniversityProvider>
      </AuthProvider>
    </SafeAreaProvider>
  )
}
