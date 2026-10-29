import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { ScrollView, StyleSheet, Text } from 'react-native'
import { Button } from '../components/Button'
import { useAuth } from '../hooks/useAuth'
import type { RootStackParamList } from '../navigation/types'
import { useColors } from '../theme/useColors'

type WelcomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>

export default function WelcomeScreen({ navigation }: WelcomeScreenProps) {
  const colors = useColors()
  const { user } = useAuth()

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.container}
    >
      <Text style={[styles.title, { color: colors.primary }]}>RumboU</Text>
      <Text style={[styles.subtitle, { color: colors.text }]}>Hola, {user?.nombre}</Text>
      <Text style={[styles.subtitle, { color: colors.muted }]}>
        Prepárate para el examen de admisión de la UNI y San Marcos con simulacros reales.
      </Text>
      <Button title="Rendir un simulacro" onPress={() => navigation.navigate('NewExam')} />
      <Button title="Desafío de hoy" onPress={() => navigation.navigate('Challenge')} />
      <Button title="Asistente RumboU" onPress={() => navigation.navigate('Assistant')} />
      <Button
        title="Mis simulacros"
        variant="secondary"
        onPress={() => navigation.navigate('ExamHistory')}
      />
      <Button
        title="Mi plan de estudio"
        variant="secondary"
        onPress={() => navigation.navigate('StudyPlan')}
      />
      <Button
        title="Mi perfil"
        variant="secondary"
        onPress={() => navigation.navigate('Profile')}
      />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
})
