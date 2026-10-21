import { Ionicons } from '@expo/vector-icons'
import { useState, type ComponentProps } from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'
import { tutorService } from '../services/tutorService'
import type { Palette } from '../theme/colors'
import { useColors } from '../theme/useColors'
import type { SolutionPhoto, SolutionReview, SolutionVerdict } from '../types/solution'
import { formatMath } from '../utils/formatMath'
import { notify } from '../utils/notify'
import { pickSolutionPhoto, type PhotoSource } from '../utils/pickSolutionPhoto'
import { Button } from './Button'

const verdicts: Record<
  SolutionVerdict,
  {
    title: string
    icon: ComponentProps<typeof Ionicons>['name']
    color: keyof Palette
    background: keyof Palette
  }
> = {
  CORRECTA: {
    title: 'Procedimiento correcto',
    icon: 'checkmark-circle',
    color: 'success',
    background: 'successSoft',
  },
  PARCIAL: {
    title: 'Vas bien, pero hay un error',
    icon: 'alert-circle',
    color: 'accentText',
    background: 'accentSoft',
  },
  INCORRECTA: {
    title: 'Revisa tu planteamiento',
    icon: 'close-circle',
    color: 'danger',
    background: 'dangerSoft',
  },
  ILEGIBLE: {
    title: 'No pude leer tu foto',
    icon: 'eye-off',
    color: 'muted',
    background: 'surfaceMuted',
  },
}

function ReviewResult({ review }: { review: SolutionReview }) {
  const colors = useColors()
  const verdict = verdicts[review.veredicto]

  return (
    <View
      accessibilityLiveRegion="polite"
      style={[styles.result, { backgroundColor: colors[verdict.background] }]}
    >
      <View style={styles.row}>
        <Ionicons name={verdict.icon} size={24} color={colors[verdict.color]} />
        <Text style={[styles.title, { color: colors.text }]}>{verdict.title}</Text>
      </View>
      <Text style={[styles.body, { color: colors.text }]}>
        {formatMath(review.retroalimentacion)}
      </Text>
    </View>
  )
}

// Sensor de cámara: foto del procedimiento en papel que el tutor revisa paso a paso.
export function SolutionPhotoReview({ questionId }: { questionId: number }) {
  const colors = useColors()
  const [photo, setPhoto] = useState<SolutionPhoto | null>(null)
  const [review, setReview] = useState<SolutionReview | null>(null)
  const [sending, setSending] = useState(false)

  const choose = async (source: PhotoSource) => {
    try {
      const picked = await pickSolutionPhoto(source)
      if (!picked) return
      setPhoto(picked)
      setReview(null)
    } catch (error) {
      notify.error(error)
    }
  }

  const send = async () => {
    if (!photo) return
    setSending(true)
    try {
      setReview(await tutorService.reviewSolution(questionId, photo))
    } catch (error) {
      notify.error(error)
    } finally {
      setSending(false)
    }
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={styles.row}>
        <Ionicons name="camera-outline" size={22} color={colors.accentText} />
        <Text style={[styles.title, { color: colors.text }]}>¿Lo resolviste en papel?</Text>
      </View>
      <Text style={{ color: colors.muted }}>
        Toma una foto de tu procedimiento y el tutor te dirá en qué paso está el error.
      </Text>
      {photo && (
        <Image
          source={{ uri: photo.uri }}
          accessibilityLabel="Foto de tu solución"
          resizeMode="contain"
          style={[styles.preview, { backgroundColor: colors.surfaceMuted }]}
        />
      )}
      {review && <ReviewResult review={review} />}
      {photo && !review && <Button title="Enviar al tutor" loading={sending} onPress={send} />}
      <View style={styles.row}>
        <View style={styles.flex}>
          <Button
            title={photo ? 'Otra foto' : 'Tomar foto'}
            variant="secondary"
            disabled={sending}
            onPress={() => choose('camera')}
          />
        </View>
        <View style={styles.flex}>
          <Button
            title="Galería"
            variant="secondary"
            disabled={sending}
            onPress={() => choose('library')}
          />
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: { gap: 12, borderRadius: 16, padding: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  flex: { flex: 1 },
  title: { flex: 1, fontSize: 16, fontWeight: '700' },
  preview: { width: '100%', height: 200, borderRadius: 12 },
  result: { gap: 6, borderRadius: 12, padding: 14 },
  body: { lineHeight: 21 },
})
