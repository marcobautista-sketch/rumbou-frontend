import { Image, StyleSheet, Text, useColorScheme, View } from 'react-native'
import { palette } from '../theme/colors'

const logo = require('../../assets/logo.png')

// El logo original de RumboU sobre su recuadro blanco, que lo mantiene legible en modo
// oscuro, y el nombre en el azul de la marca, que no cambia con el color de cada universidad.
// Es el mismo de la web.
export function BrandMark({ size = 32 }: { size?: number }) {
  const brand = palette[useColorScheme() === 'dark' ? 'dark' : 'light'].primary
  return (
    <View accessible accessibilityLabel="RumboU" style={styles.row}>
      <View style={[styles.tile, { borderRadius: size * 0.28, padding: size * 0.12 }]}>
        <Image
          source={logo}
          style={{ width: size, height: size * 0.94 }}
          accessibilityIgnoresInvertColors
        />
      </View>
      <Text style={[styles.word, { color: brand, fontSize: size * 0.66 }]}>RumboU</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  tile: { backgroundColor: '#ffffff' },
  word: { fontWeight: '800', letterSpacing: -0.3 },
})
