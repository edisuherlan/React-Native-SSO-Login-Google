import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import GradientBackground from '../components/GradientBackground';
import BrandLogo from '../components/BrandLogo';
import { spacing, typography } from '../theme/theme';

export default function SplashScreen() {
  return (
    <GradientBackground>
      <View style={styles.container}>
        <BrandLogo size={88} />
        <Text style={styles.title}>SSO Google App</Text>
        <ActivityIndicator
          color="#FFFFFF"
          style={{ marginTop: spacing.xl }}
          size="small"
        />
        <Text style={styles.caption}>Memuat sesi…</Text>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.title,
    color: '#FFFFFF',
    marginTop: spacing.lg,
  },
  caption: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.85)',
    marginTop: spacing.md,
  },
});
