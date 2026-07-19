import React, { useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../theme/theme';
import CollapsibleScreen from '../components/CollapsibleScreen';
import Card from '../components/Card';
import FadeInView from '../components/FadeInView';
import type { RootNavigation } from '../navigation/types';

interface Faq {
  key: string;
  q: string;
  a: string;
}

const FAQS: Faq[] = [
  {
    key: 'login',
    q: 'Bagaimana cara masuk?',
    a: 'Tekan tombol "Masuk dengan Google" di halaman login lalu pilih akun Google Anda. Tidak perlu membuat kata sandi.',
  },
  {
    key: 'session',
    q: 'Berapa lama saya tetap masuk?',
    a: 'Sesi Anda berlaku 14 hari. Selama aktif, Anda tidak perlu login ulang. Setelah 14 hari tidak aktif, Anda akan diminta masuk kembali.',
  },
  {
    key: 'logout',
    q: 'Bagaimana cara keluar?',
    a: 'Buka tab Profil lalu tekan tombol "Keluar", atau melalui halaman Keamanan → "Akhiri Sesi Sekarang".',
  },
  {
    key: 'data',
    q: 'Apakah data saya aman?',
    a: 'Ya. Sesi lokal dienkripsi (AES-256) dan kunci disimpan di Keychain/Keystore. Data profil tersimpan aman di Cloud Firestore.',
  },
  {
    key: 'offline',
    q: 'Apakah bisa dipakai tanpa internet?',
    a: 'Auto-login memakai sesi lokal sehingga tetap bisa membuka aplikasi tanpa internet. Namun proses login pertama memerlukan koneksi.',
  },
];

function FaqRow({ item }: { item: Faq }) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <Pressable onPress={() => setOpen((v) => !v)}>
      <Card style={styles.faqCard}>
        <View style={styles.faqHeader}>
          <Text style={[styles.faqQ, { color: colors.text }]}>{item.q}</Text>
          <Icon
            name={open ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={colors.textMuted}
          />
        </View>
        {open ? (
          <Text style={[styles.faqA, { color: colors.textMuted }]}>{item.a}</Text>
        ) : null}
      </Card>
    </Pressable>
  );
}

export default function HelpScreen() {
  const navigation = useNavigation<RootNavigation>();
  const { colors, radius } = useTheme();

  return (
    <CollapsibleScreen
      subtitle="Pusat Bantuan"
      title="Bantuan"
      onBack={() => navigation.goBack()}>
      <FadeInView delay={40}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Pertanyaan Umum
        </Text>
      </FadeInView>

      {FAQS.map((f, i) => (
        <FadeInView key={f.key} delay={80 + i * 70}>
          <FaqRow item={f} />
        </FadeInView>
      ))}

      <FadeInView delay={480}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Masih butuh bantuan?
        </Text>
        <Pressable
          onPress={() => Linking.openURL('mailto:support@example.com')}
          style={({ pressed }) => [
            styles.contactBtn,
            {
              backgroundColor: colors.primary,
              borderRadius: radius.pill,
              opacity: pressed ? 0.9 : 1,
            },
          ]}>
          <Icon name="mail-outline" size={20} color={colors.primaryContrast} />
          <Text style={[styles.contactText, { color: colors.primaryContrast }]}>
            Hubungi Dukungan
          </Text>
        </Pressable>
      </FadeInView>
    </CollapsibleScreen>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 8,
  },
  faqCard: { marginTop: 12 },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  faqQ: { flex: 1, fontSize: 15, fontWeight: '700', marginRight: 12 },
  faqA: { fontSize: 14, lineHeight: 21, marginTop: 12 },
  contactBtn: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  contactText: { fontSize: 16, fontWeight: '700', marginLeft: 8 },
});
