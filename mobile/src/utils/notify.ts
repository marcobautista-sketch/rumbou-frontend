import Toast from 'react-native-toast-message'
import { toApiError } from '../services/apiError'

export const notify = {
  success(message: string) {
    Toast.show({ type: 'success', text1: message })
  },
  error(error: unknown) {
    const apiError = toApiError(error)
    if (apiError.kind !== 'canceled') Toast.show({ type: 'error', text1: apiError.message })
  },
}
