import toast from 'react-hot-toast'
import { toApiError } from '../api/apiError'

export const notify = {
  success(message: string) {
    toast.success(message)
  },
  error(error: unknown) {
    const apiError = toApiError(error)
    if (apiError.kind !== 'canceled') toast.error(apiError.message)
  },
}
