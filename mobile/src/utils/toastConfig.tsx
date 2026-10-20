import { BaseToast, ErrorToast, type ToastConfig } from 'react-native-toast-message'

export const toastConfig: ToastConfig = {
  success: (props) => <BaseToast {...props} text1NumberOfLines={3} />,
  error: (props) => <ErrorToast {...props} text1NumberOfLines={3} />,
}
