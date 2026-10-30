import { Ionicons } from '@expo/vector-icons'
import { useCallback, useState } from 'react'
import { ActivityIndicator, Linking, StyleSheet, Text, View } from 'react-native'
import { useFetch } from '../hooks/useFetch'
import { subscriptionService } from '../services/subscriptionService'
import { useColors } from '../theme/useColors'
import { formatExamDate } from '../utils/examLabels'
import { notify } from '../utils/notify'
import { Button } from './Button'
import { ErrorRetry } from './ErrorRetry'

const proBenefits = [
  'Simulacros ilimitados de la UNI y San Marcos',
  'Tutor de IA y asistente que explican en qué te equivocaste',
  'Hasta 3 carreras meta para comparar',
]

// El pago se hace en Mercado Pago: la app solo abre el enlace que devuelve el backend.
export function PlanCard({ isAdmin }: { isAdmin: boolean }) {
  const colors = useColors()
  const [upgrading, setUpgrading] = useState(false)
  const fetchPlan = useCallback((signal: AbortSignal) => subscriptionService.getCurrent(signal), [])
  const plan = useFetch(fetchPlan)

  const upgrade = async () => {
    setUpgrading(true)
    try {
      const { linkPago } = await subscriptionService.subscribeToPro()
      if (linkPago) await Linking.openURL(linkPago)
      plan.retry()
    } catch (error) {
      notify.error(error)
    } finally {
      setUpgrading(false)
    }
  }

  const row = (icon: 'shield-checkmark' | 'star', text: string) => (
    <View style={styles.row}>
      <Ionicons name={icon} size={22} color={colors.accentText} />
      <Text style={[styles.flex, { color: colors.text }]}>{text}</Text>
    </View>
  )

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      {isAdmin ? (
        row(
          'shield-checkmark',
          'Tu cuenta de administrador tiene acceso completo, sin límites de plan.',
        )
      ) : plan.loading ? (
        <ActivityIndicator color={colors.primary} accessibilityLabel="Cargando tu plan" />
      ) : plan.error ? (
        <ErrorRetry message={plan.error.message} onRetry={plan.retry} />
      ) : plan.data?.estado === 'ACTIVA' ? (
        row(
          'star',
          `Tienes el plan PRO${plan.data.fechaFin ? ` hasta el ${formatExamDate(plan.data.fechaFin)}` : ''}.`,
        )
      ) : plan.data?.estado === 'PENDIENTE' ? (
        <>
          <Text style={{ color: colors.muted }}>
            Tu pago está en revisión. Si no lo completaste en Mercado Pago, puedes intentarlo de
            nuevo.
          </Text>
          <Button
            title="Volver a intentar el pago"
            variant="secondary"
            loading={upgrading}
            onPress={upgrade}
          />
        </>
      ) : (
        <>
          <Text style={{ color: colors.text }}>Estás en el plan Gratuito. Con PRO tienes:</Text>
          {proBenefits.map((benefit) => (
            <Text key={benefit} style={{ color: colors.muted }}>
              • {benefit}
            </Text>
          ))}
          <Button title="Pasar a PRO por S/ 39 al mes" loading={upgrading} onPress={upgrade} />
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  card: { gap: 10, borderRadius: 16, padding: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  flex: { flex: 1 },
})
