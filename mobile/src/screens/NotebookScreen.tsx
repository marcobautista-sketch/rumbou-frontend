import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from '@react-navigation/native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useCallback, useState } from 'react'
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import { Button } from '../components/Button'
import { Chip } from '../components/Chip'
import { useAuth } from '../hooks/useAuth'
import type { RootStackParamList } from '../navigation/types'
import { notebookStore, type NotebookEntry } from '../services/notebookStore'
import { useColors } from '../theme/useColors'

type NotebookScreenProps = NativeStackScreenProps<RootStackParamList, 'Notebook'>

function EntryCard({ entry, onPress }: { entry: NotebookEntry; onPress: () => void }) {
  const colors = useColors()
  const understood = entry.status === 'UNDERSTOOD'

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${entry.topic}, ${understood ? 'ya la entendiste' : 'por repasar'}`}
      accessibilityHint="Abre la pregunta con su resolución y tus apuntes"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.surface, opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <Text style={[styles.topic, { color: colors.text }]}>{entry.topic}</Text>
      <Text numberOfLines={2} style={{ color: colors.muted }}>
        {entry.statement}
      </Text>
      <View style={styles.footer}>
        <Chip
          label={understood ? 'Ya la entendí' : 'Repasar'}
          tone={understood ? 'accent' : 'brand'}
        />
        <View style={styles.icons}>
          {entry.photo && <Ionicons name="camera" size={18} color={colors.muted} />}
          {entry.audio && <Ionicons name="mic" size={18} color={colors.muted} />}
          {entry.note.trim() !== '' && (
            <Ionicons name="document-text" size={18} color={colors.muted} />
          )}
        </View>
      </View>
    </Pressable>
  )
}

export default function NotebookScreen({ navigation }: NotebookScreenProps) {
  const colors = useColors()
  const { user } = useAuth()
  const userId = user?.id ?? null
  const [entries, setEntries] = useState<NotebookEntry[]>([])

  // Se vuelve a leer al regresar de una pregunta, porque ahí se editan los apuntes.
  useFocusEffect(
    useCallback(() => {
      if (userId !== null) setEntries(notebookStore.list(userId))
    }, [userId]),
  )

  return (
    <FlatList
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
      data={entries}
      keyExtractor={(entry) => String(entry.questionId)}
      ItemSeparatorComponent={Separator}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Ionicons name="book-outline" size={40} color={colors.primary} accessible={false} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Tu cuaderno está vacío</Text>
          <Text style={[styles.emptyText, { color: colors.muted }]}>
            Abre el resultado de un simulacro, toca una pregunta y agrega tu foto, audio o nota.
          </Text>
          <Button
            title="Ver mis simulacros"
            onPress={() => navigation.navigate('Main', { screen: 'ExamHistory' })}
          />
        </View>
      }
      renderItem={({ item }) => (
        <EntryCard
          entry={item}
          onPress={() =>
            navigation.navigate('ExamResult', { examId: item.examId, questionId: item.questionId })
          }
        />
      )}
    />
  )
}

function Separator() {
  return <View style={styles.separator} />
}

const styles = StyleSheet.create({
  content: { padding: 20 },
  separator: { height: 10 },
  card: { gap: 8, borderRadius: 16, padding: 16 },
  topic: { fontSize: 16, fontWeight: '700' },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  icons: { flexDirection: 'row', gap: 10 },
  empty: { alignItems: 'center', gap: 10, paddingVertical: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptyText: { lineHeight: 20, marginBottom: 6, textAlign: 'center' },
})
