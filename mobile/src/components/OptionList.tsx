import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useColors } from '../theme/useColors'

export interface Option<T extends string | number> {
  value: T
  label: string
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
            accessibilityState={{ checked: active }}
            onPress={() => onSelect(option.value)}
            style={[
              styles.option,
              {
                borderColor: active ? colors.accent : colors.border,
                backgroundColor: active ? colors.accentSoft : colors.surface,
              },
            ]}
          >
            {showLetters && (
              <View
                style={[
                  styles.letter,
                  active
                    ? { backgroundColor: colors.accent, borderColor: colors.accent }
                    : { borderColor: colors.muted },
                ]}
              >
                <Text style={[styles.letterText, { color: colors.text }]}>
                  {String.fromCharCode(65 + index)}
                </Text>
              </View>
            )}
            <Text style={[styles.label, { color: colors.text }]}>{option.label}</Text>
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
