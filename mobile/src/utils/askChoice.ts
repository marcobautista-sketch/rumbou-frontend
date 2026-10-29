import { Alert } from 'react-native'

// Alert con promesa: devuelve el valor del botón elegido o null si cancela.
export function askChoice(
  title: string,
  message: string,
  buttons: { text: string; value: string }[],
) {
  return new Promise<string | null>((resolve) =>
    Alert.alert(
      title,
      message,
      [
        { text: 'Cancelar', style: 'cancel', onPress: () => resolve(null) },
        ...buttons.map(({ text, value }) => ({ text, onPress: () => resolve(value) })),
      ],
      { cancelable: true, onDismiss: () => resolve(null) },
    ),
  )
}
