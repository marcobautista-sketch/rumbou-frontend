import * as ImagePicker from 'expo-image-picker'
import { Alert, Linking } from 'react-native'
import type { SolutionPhoto } from '../types/solution'
import { askChoice } from './askChoice'

export type PhotoSource = 'camera' | 'library'

const MAX_PHOTO_BYTES = 5 * 1024 * 1024

// allowsEditing deja recortar solo el procedimiento: la foto pesa menos y el tutor no se distrae.
const pickerOptions: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  allowsEditing: true,
  quality: 0.6,
}

// Antes del aviso del sistema explicamos para qué es la cámara; si la niegan, queda la galería.
async function cameraAllowed(): Promise<PhotoSource | null> {
  const current = await ImagePicker.getCameraPermissionsAsync()
  if (current.granted) return 'camera'
  if (current.canAskAgain) {
    const accepted =
      current.status !== 'undetermined' ||
      (await askChoice(
        'Usar la cámara',
        'RumboU usa la cámara solo para fotografiar tu solución en papel y enviársela al tutor.',
        [{ text: 'Continuar', value: 'ok' }],
      ))
    if (!accepted) return null
    if ((await ImagePicker.requestCameraPermissionsAsync()).granted) return 'camera'
  }
  const choice = await askChoice(
    'Sin acceso a la cámara',
    'Puedes elegir una foto de tu galería o dar el permiso de la cámara en Ajustes.',
    [
      { text: 'Abrir Ajustes', value: 'settings' },
      { text: 'Elegir de la galería', value: 'library' },
    ],
  )
  if (choice === 'settings') await Linking.openSettings()
  return choice === 'library' ? 'library' : null
}

export async function pickSolutionPhoto(source: PhotoSource): Promise<SolutionPhoto | null> {
  const allowed = source === 'camera' ? await cameraAllowed() : 'library'
  if (!allowed) return null

  // La galería usa el selector del sistema: no necesita permiso.
  const result =
    allowed === 'camera'
      ? await ImagePicker.launchCameraAsync(pickerOptions)
      : await ImagePicker.launchImageLibraryAsync(pickerOptions)
  if (result.canceled) return null

  const asset = result.assets[0]
  if (asset.fileSize && asset.fileSize > MAX_PHOTO_BYTES) {
    Alert.alert('La foto es muy pesada', 'Recórtala solo a tu procedimiento o toma otra.')
    return null
  }
  return {
    uri: asset.uri,
    name: asset.fileName ?? 'solucion.jpg',
    type: asset.mimeType ?? 'image/jpeg',
  }
}
