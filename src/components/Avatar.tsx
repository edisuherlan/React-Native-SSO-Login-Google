import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/theme';

interface Props {
  uri?: string | null;
  name?: string | null;
  email?: string | null;
  size?: number;
}

export default function Avatar({ uri, name, email, size = 96 }: Props) {
  const { colors } = useTheme();
  const initial = (name || email || '?').charAt(0).toUpperCase();

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[
          styles.avatar,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: colors.surface,
          },
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.avatar,
        styles.fallback,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.primary,
          borderColor: colors.surface,
        },
      ]}>
      <Text style={[styles.initial, { fontSize: size * 0.4 }]}>{initial}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    borderWidth: 4,
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});
