import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme, accents } from '../theme/theme';
import CollapsibleScreen from '../components/CollapsibleScreen';
import BrandLogo from '../components/BrandLogo';
import Card from '../components/Card';
import FadeInView from '../components/FadeInView';
import type { RootNavigation } from '../navigation/types';

const APP_VERSION = '1.0.0';

const FEATURES = [
  'Login sekali klik dengan Google (SSO)',
  'Sesi aman bertahan 14 hari',
  'Data profil tersimpan di Cloud Firestore',
  'Sesi lokal terenkripsi (Keychain + MMKV)',
  'Mode gelap otomatis & tampilan responsif',
];

const TECH = [
  'React Native',
  'TypeScript',
  'Firebase Auth',
  'Firestore',
  'MMKV',
  'Zustand',
  'React Navigation',
];

interface LinkRow {
  key: string;
  label: string;
  icon: string;
  url: string;
}

const LINKS: LinkRow[] = [
  { key: 'privacy', label: 'Kebijakan Privasi', icon: 'shield-checkmark-outline', url: 'https://example.com/privacy' },
  { key: 'terms', label: 'Ketentuan Layanan', icon: 'document-text-outline', url: 'https://example.com/terms' },
  { key: 'contact', label: 'Hubungi Kami', icon: 'mail-outline', url: 'mailto:support@example.com' },
];

interface DevLink extends LinkRow {
  color: string;
}

const DEVELOPER = {
  name: 'Edi Suherlan',
  role: 'React Native Developer',
  initials: 'ES',
  links: [
    { key: 'web', label: 'audhighasu.com', icon: 'globe-outline', url: 'https://audhighasu.com', color: accents.cyan },
    { key: 'email', label: 'audhighasu@gmail.com', icon: 'mail-outline', url: 'mailto:audhighasu@gmail.com', color: accents.magenta },
    { key: 'github', label: 'github.com/edisuherlan', icon: 'logo-github', url: 'https://github.com/edisuherlan', color: accents.purple },
    { key: 'linkedin', label: 'linkedin.com/in/edisuherlan', icon: 'logo-linkedin', url: 'https://www.linkedin.com/in/edisuherlan/', color: '#0A66C2' },
  ] as DevLink[],
};

export default function AboutScreen() {
  const navigation = useNavigation<RootNavigation>();
  const { colors, radius } = useTheme();

  const openLink = (url: string) => {
    Linking.openURL(url).catch(() => {});
  };

  return (
    <CollapsibleScreen
      subtitle="Info"
      title="Tentang Aplikasi"
      onBack={() => navigation.goBack()}>
      <FadeInView delay={40}>
        <Card style={styles.identityCard}>
          <View style={[styles.logoWrap, { backgroundColor: colors.primary }]}>
            <BrandLogo size={72} />
          </View>
          <Text style={[styles.appName, { color: colors.text }]}>
            SSO Google App
          </Text>
          <View
            style={[
              styles.versionPill,
              { backgroundColor: colors.surfaceAlt, borderRadius: radius.pill },
            ]}>
            <Text style={[styles.versionText, { color: colors.textMuted }]}>
              Versi {APP_VERSION}
            </Text>
          </View>
          <Text style={[styles.tagline, { color: colors.textMuted }]}>
            Aplikasi contoh autentikasi Single Sign-On Google dengan sesi 14 hari
            dan penyimpanan Firestore.
          </Text>
        </Card>
      </FadeInView>

      <FadeInView delay={120}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Fitur Utama
        </Text>
        <Card>
          {FEATURES.map((f, i) => (
            <View key={f} style={[styles.featureRow, i > 0 && styles.featureRowMt]}>
              <Icon name="checkmark-circle" size={20} color={colors.success} />
              <Text style={[styles.featureText, { color: colors.text }]}>{f}</Text>
            </View>
          ))}
        </Card>
      </FadeInView>

      <FadeInView delay={200}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Teknologi</Text>
        <View style={styles.chips}>
          {TECH.map((t) => (
            <View
              key={t}
              style={[
                styles.chip,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderRadius: radius.pill,
                },
              ]}>
              <Text style={[styles.chipText, { color: colors.text }]}>{t}</Text>
            </View>
          ))}
        </View>
      </FadeInView>

      <FadeInView delay={280}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Pembuat Aplikasi
        </Text>
        <Card>
          <View style={styles.devHeader}>
            <View
              style={[
                styles.devAvatar,
                { backgroundColor: colors.primary, borderRadius: radius.lg },
              ]}>
              <Text style={styles.devInitials}>{DEVELOPER.initials}</Text>
            </View>
            <View style={styles.devInfo}>
              <Text style={[styles.devName, { color: colors.text }]}>
                {DEVELOPER.name}
              </Text>
              <Text style={[styles.devRole, { color: colors.textMuted }]}>
                {DEVELOPER.role}
              </Text>
            </View>
          </View>
          <View style={[styles.devDivider, { backgroundColor: colors.border }]} />
          {DEVELOPER.links.map((l, i) => (
            <Pressable
              key={l.key}
              onPress={() => openLink(l.url)}
              style={({ pressed }) => [
                styles.devLinkRow,
                i > 0 && styles.devLinkMt,
                { opacity: pressed ? 0.6 : 1 },
              ]}>
              <View
                style={[
                  styles.linkIcon,
                  { backgroundColor: l.color + '1A', borderRadius: radius.sm },
                ]}>
                <Icon name={l.icon} size={18} color={l.color} />
              </View>
              <Text style={[styles.devLinkLabel, { color: colors.text }]}>
                {l.label}
              </Text>
              <Icon name="open-outline" size={16} color={colors.textMuted} />
            </Pressable>
          ))}
        </Card>
      </FadeInView>

      <FadeInView delay={360}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Tautan</Text>
        <Card padded={false} style={styles.linksCard}>
          {LINKS.map((link, i) => (
            <Pressable
              key={link.key}
              onPress={() => openLink(link.url)}
              style={({ pressed }) => [
                styles.linkRow,
                { opacity: pressed ? 0.6 : 1 },
                i < LINKS.length - 1 && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: colors.border,
                },
              ]}>
              <View
                style={[
                  styles.linkIcon,
                  { backgroundColor: colors.surfaceAlt, borderRadius: radius.sm },
                ]}>
                <Icon name={link.icon} size={18} color={colors.primary} />
              </View>
              <Text style={[styles.linkLabel, { color: colors.text }]}>
                {link.label}
              </Text>
              <Icon name="chevron-forward" size={18} color={colors.textMuted} />
            </Pressable>
          ))}
        </Card>
      </FadeInView>

      <Text style={[styles.footer, { color: colors.textMuted }]}>
        Dibuat dengan React Native{'\n'}© {new Date().getFullYear()} SSO Google App
      </Text>
    </CollapsibleScreen>
  );
}

const styles = StyleSheet.create({
  identityCard: { alignItems: 'center', paddingVertical: 24 },
  logoWrap: {
    borderRadius: 24,
    padding: 4,
  },
  appName: { fontSize: 20, fontWeight: '800', marginTop: 14 },
  versionPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginTop: 8,
  },
  versionText: { fontSize: 12, fontWeight: '600' },
  tagline: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 12,
  },
  featureRow: { flexDirection: 'row', alignItems: 'center' },
  featureRowMt: { marginTop: 14 },
  featureText: { flex: 1, fontSize: 14, marginLeft: 12, lineHeight: 20 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
  },
  chipText: { fontSize: 13, fontWeight: '600' },
  devHeader: { flexDirection: 'row', alignItems: 'center' },
  devAvatar: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  devInitials: { color: '#FFFFFF', fontSize: 20, fontWeight: '800' },
  devInfo: { marginLeft: 14, flex: 1 },
  devName: { fontSize: 17, fontWeight: '700' },
  devRole: { fontSize: 13, marginTop: 2 },
  devDivider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 16,
  },
  devLinkRow: { flexDirection: 'row', alignItems: 'center' },
  devLinkMt: { marginTop: 14 },
  devLinkLabel: { flex: 1, fontSize: 14.5, fontWeight: '600', marginLeft: 12 },
  linksCard: { overflow: 'hidden' },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  linkIcon: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  linkLabel: { flex: 1, fontSize: 15, fontWeight: '600' },
  footer: {
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 28,
  },
});
