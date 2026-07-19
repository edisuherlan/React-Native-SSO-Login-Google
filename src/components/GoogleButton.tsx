import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTheme } from '../theme/theme';
import GoogleGlyph from './GoogleGlyph';

interface Props {
  onPress: () => void;
  loading?: boolean;
  label?: string;
}

export default function GoogleButton({
  onPress,
  loading = false,
  label = 'Masuk dengan Google',
}: Props) {
  const { colors, radius, typography, spacing } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: colors.primary,
          borderRadius: radius.pill,
          paddingVertical: spacing.lg,
          opacity: pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
          shadowColor: colors.primary,
        },
      ]}>
      {loading ? (
        <ActivityIndicator color={colors.primaryContrast} />
      ) : (
        <View style={styles.content}>
          <GoogleGlyph size={18} />
          <Text
            style={[
              styles.label,
              typography.button,
              { color: colors.primaryContrast, marginLeft: spacing.md },
            ]}>
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    includeFontPadding: false,
  },
});
