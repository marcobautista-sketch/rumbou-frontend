// Expo Go solo abre actualizaciones cuyo runtime es el de su propio SDK (exposdk:58.0.0). Con la
// variable RUMBOU_EXPO_GO=1 se publica al canal "expo-go" con ese runtime; sin la variable, el APK
// sigue usando la política appVersion de app.json y no se mezcla con esas actualizaciones.
module.exports = ({ config }) => ({
  ...config,
  runtimeVersion: process.env.RUMBOU_EXPO_GO ? { policy: 'sdkVersion' } : config.runtimeVersion,
})
