import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../auth/authStore';
import { useTheme } from '../theme/theme';
import GradientBackground from '../components/GradientBackground';
import GoogleButton from '../components/GoogleButton';
import BrandLogo from '../components/BrandLogo';

const FEATURES = ['Login sekali', 'Sesi 14 hari', 'Aman & privat'];

export default function LoginScreen() {
  const login = useAuthStore((s) => s.login);
  const error = useAuthStore((s) => s.error);
  const { colors, spacing, radius, typography } = useTheme();
  const { height } = useWindowDimensions();
  const [loading, setLoading] = useState(false);

  const onPress = async () => {
    setLoading(true);
    await login();
    setLoading(false);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.surface }]}>
      <GradientBackground style={{ minHeight: height * 0.58 }}>
        <SafeAreaView style={styles.heroSafe} edges={['top']}>
          <View style={styles.hero}>
            <BrandLogo size={80} />
            <Text style={styles.appName}>SSO Google App</Text>
            <Text style={styles.tagline}>
              Masuk cepat dan aman dengan akun Google Anda.
            </Text>

            <View style={styles.chips}>
              {FEATURES.map((f) => (
                <View key={f} style={styles.chip}>
                  <Text style={styles.chipText}>{f}</Text>
                </View>
              ))}
            </View>
          </View>
        </SafeAreaView>
      </GradientBackground>

      <SafeAreaView
        edges={['bottom']}
        style={[
          styles.sheet,
          {
            backgroundColor: colors.surface,
            borderTopLeftRadius: radius.xl,
            borderTopRightRadius: radius.xl,
          },
        ]}>
        <View style={styles.sheetInner}>
          <Text style={[styles.sheetTitle, typography.title, { color: colors.text }]}>
            Selamat datang 👋
          </Text>
          <Text
            style={[
              styles.sheetSubtitle,
              typography.body,
              { color: colors.textMuted },
            ]}>
            Lanjutkan untuk mengakses akun Anda.
          </Text>

          {error ? (
            <View
              style={[
                styles.errorBox,
                {
                  backgroundColor: colors.danger + '1A',
                  borderColor: colors.danger + '55',
                  borderRadius: radius.md,
                },
              ]}>
              <Text style={[styles.errorText, { color: colors.danger }]}>
                {error}
              </Text>
            </View>
          ) : null}

          <View style={{ marginTop: spacing.xl }}>
            <GoogleButton onPress={onPress} loading={loading} />
          </View>

          <Text
            style={[styles.terms, typography.caption, { color: colors.textMuted }]}>
            Dengan masuk, Anda menyetujui Ketentuan Layanan & Kebijakan Privasi.
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  heroSafe: {
    flex: 1,
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  appName: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 18,
    letterSpacing: -0.4,
  },
  tagline: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 22,
    maxWidth: 320,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 24,
    gap: 8,
  },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
  },
  chipText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  sheet: {
    marginTop: -24,
  },
  sheetInner: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: 12,
  },
  sheetTitle: {
    marginBottom: 6,
  },
  sheetSubtitle: {
    lineHeight: 21,
  },
  errorBox: {
    marginTop: 20,
    padding: 12,
    borderWidth: 1,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  terms: {
    textAlign: 'center',
    marginTop: 18,
    lineHeight: 18,
  },
});
