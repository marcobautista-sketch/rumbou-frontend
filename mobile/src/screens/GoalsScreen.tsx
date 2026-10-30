import { useCallback, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { Button } from '../components/Button'
import { ErrorRetry } from '../components/ErrorRetry'
import { ProgressBar } from '../components/ProgressBar'
import { useFetch } from '../hooks/useFetch'
import { goalService } from '../services/goalService'
import type { Palette } from '../theme/colors'
import { useColors } from '../theme/useColors'
import type { Goal, PreparationStatus } from '../types/goal'
import type { AcademicOffer } from '../types/offer'
import { formatScore } from '../utils/examLabels'
import { notify } from '../utils/notify'

const MAX_RESULTS = 15

const statusTones: Record<PreparationStatus, { color: keyof Palette; background: keyof Palette }> =
  {
    HOLGADO: { color: 'success', background: 'successSoft' },
    AJUSTADO: { color: 'accentText', background: 'accentSoft' },
    CERCA: { color: 'primary', background: 'chip' },
    REFORZAR: { color: 'danger', background: 'dangerSoft' },
  }

function GoalCard({ goal, onRemove }: { goal: Goal; onRemove: (goal: Goal) => void }) {
  const colors = useColors()
  const tone = goal.estado ? statusTones[goal.estado] : null

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <Text style={[styles.title, { color: colors.text }]}>{goal.carrera}</Text>
      <Text style={{ color: colors.muted }}>
        {goal.universidad} · {goal.area} · Proceso {goal.procesoAdmision}
      </Text>
      {goal.ultimoPsp === null ? (
        <Text style={{ color: colors.muted }}>
          Rinde un simulacro completo o un diagnóstico para calcular tu probabilidad de ingreso.
        </Text>
      ) : (
        <>
          <View style={styles.between}>
            <Text style={{ color: colors.text }}>Tu puntaje: {formatScore(goal.ultimoPsp)}</Text>
            <Text style={{ color: colors.muted }}>
              Último ingresante: {formatScore(goal.puntajeUltimoIngresante)}
            </Text>
          </View>
          <ProgressBar
            value={Math.min(goal.ultimoPsp, goal.puntajeUltimoIngresante)}
            max={goal.puntajeUltimoIngresante}
            label="Tu puntaje frente al del último ingresante"
          />
          {tone && goal.estadoDescripcion && (
            <Text
              style={[
                styles.badge,
                { color: colors[tone.color], backgroundColor: colors[tone.background] },
              ]}
            >
              {goal.estadoDescripcion}
            </Text>
          )}
        </>
      )}
      <Button title="Quitar de mis metas" variant="secondary" onPress={() => onRemove(goal)} />
    </View>
  )
}

function OfferRow({
  offer,
  adding,
  onAdd,
}: {
  offer: AcademicOffer
  adding: boolean
  onAdd: (offer: AcademicOffer) => void
}) {
  const colors = useColors()
  return (
    <View style={[styles.offer, { borderColor: colors.border }]}>
      <View style={styles.flex}>
        <Text style={[styles.offerTitle, { color: colors.text }]}>{offer.carrera}</Text>
        <Text style={{ color: colors.muted }}>
          {offer.universidad} · Último ingresante: {formatScore(offer.puntajeUltimoIngresante)}
        </Text>
      </View>
      <Button title="Agregar" loading={adding} onPress={() => onAdd(offer)} />
    </View>
  )
}

// Metas: las carreras a las que postula, con su probabilidad de ingreso, y el catálogo para sumar otra.
export default function GoalsScreen() {
  const colors = useColors()
  const [search, setSearch] = useState('')
  const [addingId, setAddingId] = useState<number | null>(null)
  const fetchGoals = useCallback((signal: AbortSignal) => goalService.list(signal), [])
  const fetchOffers = useCallback((signal: AbortSignal) => goalService.listOffers(signal), [])
  const goals = useFetch(fetchGoals)
  const offers = useFetch(fetchOffers)

  const results = useMemo(() => {
    const chosen = new Set(goals.data?.map((goal) => goal.ofertaAcademicaId))
    const text = search.trim().toLowerCase()
    if (!text) return []
    return (offers.data ?? [])
      .filter((offer) => !chosen.has(offer.id))
      .filter((offer) => `${offer.carrera} ${offer.universidad}`.toLowerCase().includes(text))
      .slice(0, MAX_RESULTS)
  }, [offers.data, goals.data, search])

  const add = async (offer: AcademicOffer) => {
    setAddingId(offer.id)
    try {
      await goalService.create(offer.id)
      notify.success(`${offer.carrera} ya es una de tus metas.`)
      setSearch('')
      goals.retry()
    } catch (error) {
      // El plan gratuito permite una sola meta activa: el backend explica el límite.
      notify.error(error)
    } finally {
      setAddingId(null)
    }
  }

  const remove = (goal: Goal) =>
    Alert.alert(
      '¿Quitar esta meta?',
      `${goal.carrera} dejará de aparecer en tu panel. Tus simulacros no se borran.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Quitar',
          style: 'destructive',
          onPress: async () => {
            try {
              await goalService.remove(goal.id)
              notify.success('Meta quitada.')
              goals.retry()
            } catch (error) {
              notify.error(error)
            }
          },
        },
      ],
    )

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      refreshControl={<RefreshControl refreshing={false} onRefresh={goals.retry} />}
    >
      <Text style={[styles.heading, { color: colors.text }]}>Mis metas</Text>
      {goals.loading ? (
        <ActivityIndicator color={colors.primary} accessibilityLabel="Cargando tus metas" />
      ) : goals.error ? (
        <ErrorRetry message={goals.error.message} onRetry={goals.retry} />
      ) : goals.data?.length === 0 ? (
        <Text style={{ color: colors.muted }}>
          Aún no eliges una carrera. Búscala abajo y agrégala para ver tu probabilidad de ingreso.
        </Text>
      ) : (
        goals.data?.map((goal) => <GoalCard key={goal.id} goal={goal} onRemove={remove} />)
      )}

      <Text style={[styles.heading, { color: colors.text }]}>Agregar una carrera</Text>
      <TextInput
        accessibilityLabel="Buscar carrera"
        placeholder="Busca por carrera o universidad"
        placeholderTextColor={colors.muted}
        value={search}
        onChangeText={setSearch}
        style={[
          styles.search,
          { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface },
        ]}
      />
      {offers.error ? (
        <ErrorRetry message={offers.error.message} onRetry={offers.retry} />
      ) : search.trim() && results.length === 0 && !offers.loading ? (
        <Text style={{ color: colors.muted }}>No encontramos carreras con «{search.trim()}».</Text>
      ) : (
        results.map((offer) => (
          <OfferRow key={offer.id} offer={offer} adding={addingId === offer.id} onAdd={add} />
        ))
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  content: { gap: 14, padding: 20 },
  heading: { fontSize: 18, fontWeight: '700' },
  card: { gap: 10, borderRadius: 16, padding: 16 },
  title: { fontSize: 17, fontWeight: '700' },
  between: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 },
  badge: {
    alignSelf: 'flex-start',
    overflow: 'hidden',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
    fontWeight: '600',
  },
  search: { minHeight: 48, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, fontSize: 16 },
  offer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
    paddingVertical: 10,
  },
  offerTitle: { fontWeight: '600' },
  flex: { flex: 1 },
})
