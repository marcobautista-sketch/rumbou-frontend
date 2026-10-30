import { Ionicons } from '@expo/vector-icons'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import type { ComponentProps } from 'react'
import ChallengeScreen from '../screens/ChallengeScreen'
import ExamHistoryScreen from '../screens/exams/ExamHistoryScreen'
import GoalsScreen from '../screens/GoalsScreen'
import HomeScreen from '../screens/HomeScreen'
import ProfileScreen from '../screens/ProfileScreen'
import { useColors } from '../theme/useColors'
import type { MainTabParamList } from './types'

type IconName = ComponentProps<typeof Ionicons>['name']

const Tab = createBottomTabNavigator<MainTabParamList>()

const tabIcons: Record<keyof MainTabParamList, IconName> = {
  Home: 'home',
  ExamHistory: 'document-text',
  Goals: 'flag',
  Challenge: 'flash',
  Profile: 'person',
}

export function MainTabs() {
  const colors = useColors()

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: colors.accentText,
        tabBarInactiveTintColor: colors.muted,
        tabBarIcon: ({ color, size, focused }) => (
          <Ionicons
            name={focused ? tabIcons[route.name] : (`${tabIcons[route.name]}-outline` as IconName)}
            size={size}
            color={color}
          />
        ),
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Inicio', headerShown: false }}
      />
      <Tab.Screen
        name="ExamHistory"
        component={ExamHistoryScreen}
        options={{ title: 'Simulacros', headerTitle: 'Mis simulacros' }}
      />
      <Tab.Screen
        name="Goals"
        component={GoalsScreen}
        options={{ title: 'Metas', headerTitle: 'Mis metas' }}
      />
      <Tab.Screen
        name="Challenge"
        component={ChallengeScreen}
        options={{ title: 'Desafío', headerTitle: 'Desafío diario' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Perfil', headerTitle: 'Mi perfil' }}
      />
    </Tab.Navigator>
  )
}
