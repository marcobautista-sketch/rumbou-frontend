import type { ReactNode } from 'react'
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useColors } from '../theme/useColors'

const logo = require('../../assets/logo.png')

interface AuthScreenLayoutProps {
  title: string
  subtitle: string
  children: ReactNode
}

export function AuthScreenLayout({ title, subtitle, children }: AuthScreenLayoutProps) {
  const colors = useColors()

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.safeArea}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <View style={styles.logoTile}>
              <Image source={logo} style={styles.logo} accessibilityIgnoresInvertColors />
            </View>
            <Text style={[styles.brand, { color: colors.primary }]}>RumboU</Text>
            <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>
              {title}
            </Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>{subtitle}</Text>
          </View>
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: 16,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  logoTile: {
    borderRadius: 16,
    padding: 8,
    backgroundColor: '#ffffff',
  },
  logo: {
    width: 64,
    height: 60,
  },
  brand: {
    fontSize: 32,
    fontWeight: '700',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
  },
})
