import type { ReactNode } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useColors } from '../theme/useColors'

export interface Option<T extends string | number> {
  value: T
  // Texto plano: se muestra y lo lee el lector de pantalla.
  label: string
  // Contenido propio (por ejemplo, una fórmula dibujada) en lugar del texto.
  content?: ReactNode
}

interface OptionListProps<T extends string | number> {
  options: Option<T>[]
  selected: T | null
  onSelect: (value: T) => void
  accessibilityLabel: string
  showLetters?: boolean
}

export function OptionList<T extends string | number>({
  options,
  selected,
  onSelect,
  accessibilityLabel,
  showLetters = false,
}: OptionListProps<T>) {
  const colors = useColors()

  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
      style={styles.list}
    >
      {options.map((option, index) => {
        const active = option.value === selected
        return (
          <Pressable
            key={String(option.value)}
            accessibilityRole="radio"
            accessibilityLabel={option.label}
            accessibilityState={{ checked: active }}
            onPress={() => onSelect(option.value)}
            style={[
              styles.option,
              {
                borderColor: active ? colors.primary : colors.border,
                backgroundColor: active ? colors.chip : colors.surface,
              },
            ]}
          >
            {showLetters && (
              <View
                style={[
                  styles.letter,
                  active
                    ? { backgroundColor: colors.primary, borderColor: colors.primary }
                    : { borderColor: colors.muted },
                ]}
              >
                <Text
                  style={[styles.letterText, { color: active ? colors.onPrimary : colors.text }]}
                >
                  {String.fromCharCode(65 + index)}
                </Text>
              </View>
            )}
            {option.content ? (
              <View style={styles.label}>{option.content}</View>
            ) : (
              <Text style={[styles.label, { color: colors.text }]}>{option.label}</Text>
            )}
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  list: {
    gap: 8,
  },
  option: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  letter: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderWidth: 2,
  },
  letterText: {
    fontSize: 13,
    fontWeight: '700',
  },
  label: {
    flex: 1,
    fontSize: 16,
  },
})
