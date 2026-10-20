import * as LocalAuthentication from 'expo-local-authentication'
import * as SecureStore from 'expo-secure-store'

const PREFERENCE_KEY = 'rumbou.biometricLogin'

export const biometricService = {
  async isAvailable() {
    const [hasHardware, isEnrolled] = await Promise.all([
      LocalAuthentication.hasHardwareAsync(),
      LocalAuthentication.isEnrolledAsync(),
    ])
    return hasHardware && isEnrolled
  },

  async isEnabled() {
    return (await SecureStore.getItemAsync(PREFERENCE_KEY)) === 'on'
  },

  enable: () => SecureStore.setItemAsync(PREFERENCE_KEY, 'on'),

  async authenticate() {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Entra a RumboU con tu huella o tu rostro',
      cancelLabel: 'Usar contraseña',
    })
    return result.success
  },
}
