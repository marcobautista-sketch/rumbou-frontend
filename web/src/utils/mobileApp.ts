// La app se publica con EAS Update (ver mobile/app.json y mobile/eas.json) y se abre en Expo Go.
// Si cambia el SDK de Expo del móvil, hay que actualizar runtime-version.
const EAS_PROJECT_ID = '7bd9af25-e597-41fb-9fd6-6265a5257f45'

export const expoGoLink = `exp://u.expo.dev/${EAS_PROJECT_ID}?channel-name=preview&runtime-version=exposdk:58.0.0`

export const expoGoStores = {
  android: 'https://play.google.com/store/apps/details?id=host.exp.exponent',
  ios: 'https://apps.apple.com/app/expo-go/id982107779',
}

// Enlace al APK de `eas build`. Con VITE_ANDROID_APK_URL definida en Vercel, el botón de Android
// descarga la app directamente en lugar de llevar a Expo Go.
export const androidApkUrl: string | undefined = import.meta.env.VITE_ANDROID_APK_URL || undefined
