import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../theme/theme';

interface Props {
  children?: React.ReactNode;
  style?: ViewStyle;
}

/**
 * Latar gradient diagonal dengan dua "blob" dekoratif untuk kesan modern & berdimensi.
 */
export default function GradientBackground({ children, style }: Props) {
  const { colors } = useTheme();
  return (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.fill, style]}>
      <View style={[styles.blob, styles.blobTop]} />
      <View style={[styles.blob, styles.blobBottom]} />
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    overflow: 'hidden',
  },
  blob: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 999,
  },
  blobTop: {
    width: 260,
    height: 260,
    top: -80,
    right: -60,
  },
  blobBottom: {
    width: 200,
    height: 200,
    bottom: -40,
    left: -50,
  },
});
