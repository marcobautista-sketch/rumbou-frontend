import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useCallback, useState } from 'react'
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native'
import { TextInput } from 'react-native-paper'
import { Button } from '../components/Button'
import { ErrorRetry } from '../components/ErrorRetry'
import { LoadingView } from '../components/LoadingView'
import { StatCard } from '../components/StatCard'
import { useAuth } from '../hooks/useAuth'
import { useFetch } from '../hooks/useFetch'
import type { RootStackParamList } from '../navigation/types'
import { rankingService } from '../services/rankingService'
import { useColors } from '../theme/useColors'
import type { League, LeagueEntry } from '../types/league'
import { notify } from '../utils/notify'
import { universityShort } from '../utils/universityLabels'

type LeagueScreenProps = NativeStackScreenProps<RootStackParamList, 'League'>

const PAGE_SIZE = 10
const ALIAS_PATTERN = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 ._-]{3,20}$/

function JoinCard({ onJoined }: { onJoined: () => void }) {
  const colors = useColors()
  const [alias, setAlias] = useState('')
  const [saving, setSaving] = useState(false)
  const trimmed = alias.trim()

  const join = async () => {
    setSaving(true)
    try {
      await rankingService.join(trimmed)
      notify.success('Ya estás en la liga.')
      onJoined()
    } catch (error) {
      notify.error(error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <Text style={[styles.cardTitle, { color: colors.text }]}>Únete con un alias</Text>
      <Text style={{ color: colors.muted }}>
        Participar es voluntario. Los demás solo verán tu alias y tu XP de la semana, nunca tu
        nombre. Puedes salir cuando quieras.
      </Text>
      <TextInput
        mode="outlined"
        label="Alias"
        accessibilityLabel="Alias"
        value={alias}
        onChangeText={setAlias}
        maxLength={20}
        autoCorrect={false}
        style={{ backgroundColor: colors.surface }}
      />
      <Text style={[styles.hint, { color: colors.muted }]}>
        De 3 a 20 caracteres: letras, números, espacios, puntos o guiones.
      </Text>
      <Button
        title="Unirme"
        loading={saving}
        disabled={!ALIAS_PATTERN.test(trimmed)}
        onPress={() => void join()}
      />
    </View>
  )
}

function MyStanding({ league, onLeft }: { league: League; onLeft: () => void }) {
  const colors = useColors()

  const leave = async () => {
    try {
      await rankingService.leave()
      notify.success('Saliste de la liga.')
      onLeft()
    } catch (error) {
      notify.error(error)
    }
  }

  const confirmLeave = () =>
    Alert.alert(
      '¿Salir de la liga?',
      'Tu alias dejará de aparecer. Puedes volver cuando quieras.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Salir', style: 'destructive', onPress: () => void leave() },
      ],
    )

  return (
    <View style={styles.standing}>
      <Text style={[styles.alias, { color: colors.primary }]}>Compites como {league.alias}</Text>
      <View style={styles.row}>
        <StatCard
          icon="podium"
          label="Tu posición"
          value={league.miPosicion !== null ? `#${league.miPosicion}` : '–'}
        />
        <StatCard icon="star" label="XP esta semana" value={league.miXpSemanal} />
      </View>
      {league.miPosicion === null && (
        <Text style={{ color: colors.muted }}>
          Termina un simulacro o un desafío para entrar a la tabla de esta semana.
        </Text>
      )}
      <Button title="Salir de la liga" variant="ghost" onPress={confirmLeave} />
    </View>
  )
}

function EntryRow({ entry }: { entry: LeagueEntry }) {
  const colors = useColors()

  return (
    <View
      accessible
      accessibilityLabel={`Puesto ${entry.posicion}, ${entry.alias}, ${entry.xpSemanal} XP${
        entry.esUsuarioActual ? ', tú' : ''
      }`}
      style={[
        styles.entry,
        { backgroundColor: entry.esUsuarioActual ? colors.chip : colors.surface },
      ]}
    >
      <Text style={[styles.position, { color: colors.muted }]}>{entry.posicion}</Text>
      <Text numberOfLines={1} style={[styles.entryAlias, { color: colors.text }]}>
        {entry.alias}
        {entry.esUsuarioActual ? ' (tú)' : ''}
      </Text>
      <Text style={[styles.xp, { color: colors.primary }]}>{entry.xpSemanal} XP</Text>
    </View>
  )
}

export default function LeagueScreen({ navigation }: LeagueScreenProps) {
  const colors = useColors()
  const { user } = useAuth()
  const [page, setPage] = useState(0)
  const fetchLeague = useCallback(
    (signal: AbortSignal) => rankingService.get(page, PAGE_SIZE, signal),
    [page],
  )
  const { data: league, error, loading, retry } = useFetch(fetchLeague)

  if (loading && !league) return <LoadingView />
  if (error || !league) {
    return (
      <View style={[styles.flex, styles.content, { backgroundColor: colors.background }]}>
        <ErrorRetry message={error?.message ?? 'No pudimos cargar la liga.'} onRetry={retry} />
      </View>
    )
  }

  if (!league.universidad) {
    return (
      <View style={[styles.flex, styles.content, { backgroundColor: colors.background }]}>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Elige tu carrera meta</Text>
          <Text style={{ color: colors.muted }}>
            La liga compara a quienes postulan a la misma universidad.
          </Text>
          <Button
            title="Elegir carrera"
            onPress={() => navigation.navigate('Main', { screen: 'Goals' })}
          />
        </View>
      </View>
    )
  }

  const totalPages = league.entradas.totalPages
  const applicant = user?.role === 'USER'

  const header = (
    <View style={styles.header}>
      <Text style={{ color: colors.muted }}>
        Actividad de esta semana entre quienes postulan a {universityShort(league.universidad)}.
        Mide tu constancia, no tu nivel académico. Se reinicia cada lunes.
      </Text>
      {league.participa ? (
        <MyStanding league={league} onLeft={retry} />
      ) : applicant ? (
        <JoinCard onJoined={retry} />
      ) : (
        <Text style={{ color: colors.muted }}>
          Las cuentas del equipo pueden ver la liga, pero no participan.
        </Text>
      )}
      <Text style={[styles.heading, { color: colors.text }]}>Tabla de la semana</Text>
    </View>
  )

  const pager =
    totalPages > 1 ? (
      <View style={styles.pager}>
        <View style={styles.flex}>
          <Button
            title="Anterior"
            variant="secondary"
            disabled={page === 0}
            onPress={() => setPage(page - 1)}
          />
        </View>
        <Text style={{ color: colors.muted }}>
          {page + 1} de {totalPages}
        </Text>
        <View style={styles.flex}>
          <Button
            title="Siguiente"
            variant="secondary"
            disabled={page + 1 >= totalPages}
            onPress={() => setPage(page + 1)}
          />
        </View>
      </View>
    ) : undefined

  return (
    <FlatList
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets
      data={league.entradas.content}
      keyExtractor={(entry) => String(entry.posicion)}
      ItemSeparatorComponent={Separator}
      ListHeaderComponent={header}
      ListFooterComponent={pager}
      ListEmptyComponent={
        <Text style={{ color: colors.muted }}>
          Nadie suma XP todavía esta semana. Termina un simulacro y sé el primero.
        </Text>
      }
      renderItem={({ item }) => <EntryRow entry={item} />}
    />
  )
}

function Separator() {
  return <View style={styles.separator} />
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 20 },
  header: { gap: 14, paddingBottom: 12 },
  card: { gap: 10, borderRadius: 16, padding: 16 },
  cardTitle: { fontSize: 17, fontWeight: '700' },
  hint: { fontSize: 13 },
  standing: { gap: 10 },
  alias: { fontSize: 15, fontWeight: '700' },
  row: { flexDirection: 'row', gap: 10 },
  heading: { fontSize: 18, fontWeight: '800', marginTop: 4 },
  separator: { height: 8 },
  entry: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 12, padding: 14 },
  position: { width: 28, fontSize: 15, fontWeight: '700', fontVariant: ['tabular-nums'] },
  entryAlias: { flex: 1, fontSize: 15, fontWeight: '600' },
  xp: { fontSize: 15, fontWeight: '700', fontVariant: ['tabular-nums'] },
  pager: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 14 },
})
