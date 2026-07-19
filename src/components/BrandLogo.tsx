import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/theme';

/**
 * Logo brand: kotak membulat dengan inisial. Tampil menonjol di atas gradient.
 */
export default function BrandLogo({ size = 72 }: { size?: number }) {
  const { radius } = useTheme();
  return (
    <View
      style={[
        styles.box,
        {
          width: size,
          height: size,
          borderRadius: radius.xl,
        },
      ]}>
      <Text style={[styles.mark, { fontSize: size * 0.42 }]}>S</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mark: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});
