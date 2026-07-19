import React, { useEffect, useRef } from 'react';
import { Animated, DimensionValue, StyleSheet, View } from 'react-native';
import { useTheme } from '../theme/theme';
import Card from './Card';

interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  radius?: number;
  style?: object;
}

/**
 * Blok placeholder dengan animasi pulse (opacity naik-turun).
 */
export function Skeleton({
  width = '100%',
  height = 14,
  radius = 8,
  style,
}: SkeletonProps) {
  const { colors } = useTheme();
  const opacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 650,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.5,
          duration: 650,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor: colors.surfaceAlt,
          opacity,
        },
        style,
      ]}
    />
  );
}

/** Skeleton berbentuk kartu (baris ikon + dua baris teks). */
export function SkeletonRowCard() {
  return (
    <Card style={styles.row}>
      <Skeleton width={44} height={44} radius={12} />
      <View style={styles.rowText}>
        <Skeleton width="60%" height={13} />
        <Skeleton width="85%" height={11} style={styles.mt8} />
      </View>
    </Card>
  );
}

/** Skeleton untuk kartu statistik (judul + bar + baris). */
export function SkeletonStatCard() {
  return (
    <Card>
      <Skeleton width="40%" height={16} />
      <Skeleton width="100%" height={8} radius={999} style={styles.mt16} />
      <Skeleton width="75%" height={12} style={styles.mt16} />
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  rowText: {
    flex: 1,
    marginLeft: 14,
  },
  mt8: { marginTop: 8 },
  mt16: { marginTop: 16 },
});
