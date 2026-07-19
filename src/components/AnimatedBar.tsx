import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useTheme } from '../theme/theme';

interface Props {
  progress: number; // 0..1
  height?: number;
  color?: string;
  trackColor?: string;
  delay?: number;
}

/**
 * Progress bar yang mengisi (animasi width) dari 0 ke nilai target.
 */
export default function AnimatedBar({
  progress,
  height = 8,
  color,
  trackColor,
  delay = 200,
}: Props) {
  const { colors, radius } = useTheme();
  const value = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(value, {
      toValue: Math.min(1, Math.max(0, progress)),
      duration: 900,
      delay,
      useNativeDriver: false,
    }).start();
  }, [progress, delay, value]);

  const width = value.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View
      style={[
        styles.track,
        {
          height,
          borderRadius: radius.pill,
          backgroundColor: trackColor ?? colors.surfaceAlt,
        },
      ]}>
      <Animated.View
        style={{
          height,
          width,
          borderRadius: radius.pill,
          backgroundColor: color ?? colors.primary,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
  },
});
