import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

/**
 * Tanda "G" Google sederhana (tanpa dependency SVG).
 * Lingkaran putih dengan huruf G bergaya Google-blue.
 */
export default function GoogleGlyph({ size = 22 }: { size?: number }) {
  return (
    <View
      style={[
        styles.circle,
        { width: size + 8, height: size + 8, borderRadius: (size + 8) / 2 },
      ]}>
      <Text style={[styles.letter, { fontSize: size }]}>G</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  letter: {
    fontWeight: '800',
    color: '#4285F4',
    lineHeight: undefined,
  },
});
