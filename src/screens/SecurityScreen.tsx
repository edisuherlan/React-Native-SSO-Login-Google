import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuthStore } from '../auth/authStore';
import { useTheme, accents } from '../theme/theme';
import CollapsibleScreen from '../components/CollapsibleScreen';
import Card from '../components/Card';
import FadeInView from '../components/FadeInView';
import type { RootNavigation } from '../navigation/types';

interface SecurityItem {
  key: string;
  title: string;
  desc: string;
  icon: string;
  color: string;
}

const ITEMS: SecurityItem[] = [
  {
    key: 'encrypt',
    title: 'Sesi Terenkripsi',
    desc: 'Data sesi lokal dienkripsi AES-256 di penyimpanan aman.',
    icon: 'lock-closed-outline',
    color: accents.cyan,
  },
  {
    key: 'keychain',
    title: 'Kunci di Keychain/Keystore',
    desc: 'Encryption key disimpan di secure hardware perangkat.',
    icon: 'key-outline',
    color: accents.magenta,
  },
  {
    key: 'expiry',
    title: 'Kedaluwarsa Otomatis',
    desc: 'Sesi berakhir otomatis setelah 14 hari tidak aktif.',
    icon: 'timer-outline',
    color: accents.purple,
  },
  {
    key: 'nopassword',
    title: 'Tanpa Kata Sandi',
    desc: 'Autentikasi memakai Google — tidak menyimpan password.',
    icon: 'shield-checkmark-outline',
    color: accents.lime,
  },
];

export default function SecurityScreen() {
  const navigation = useNavigation<RootNavigation>();
  const logout = useAuthStore((s) => s.logout);
  const { colors, radius } = useTheme();
  const [loading, setLoading] = useState(false);

  const onEndSession = async () => {
    setLoading(true);
    await logout();
    setLoading(false);
  };

  return (
    <CollapsibleScreen
      subtitle="Perlindungan"
      title="Keamanan"
      onBack={() => navigation.goBack()}>
      <FadeInView delay={40}>
        <Card style={styles.hero}>
          <View
            style={[
              styles.heroIcon,
              { backgroundColor: colors.success + '1A', borderRadius: radius.pill },
            ]}>
            <Icon name="shield-checkmark" size={30} color={colors.success} />
          </View>
          <Text style={[styles.heroTitle, { color: colors.text }]}>
            Akun Anda Terlindungi
          </Text>
          <Text style={[styles.heroDesc, { color: colors.textMuted }]}>
            Aplikasi menerapkan praktik keamanan modern untuk menjaga data & sesi
            Anda.
          </Text>
        </Card>
      </FadeInView>

      {ITEMS.map((item, i) => (
        <FadeInView key={item.key} delay={120 + i * 80}>
          <Card style={styles.item}>
            <View
              style={[
                styles.itemIcon,
                { backgroundColor: item.color + '1A', borderRadius: radius.md },
              ]}>
              <Icon name={item.icon} size={22} color={item.color} />
            </View>
            <View style={styles.itemText}>
              <Text style={[styles.itemTitle, { color: colors.text }]}>
                {item.title}
              </Text>
              <Text style={[styles.itemDesc, { color: colors.textMuted }]}>
                {item.desc}
              </Text>
            </View>
          </Card>
        </FadeInView>
      ))}

      <FadeInView delay={480}>
        <Pressable
          onPress={onEndSession}
          disabled={loading}
          style={({ pressed }) => [
            styles.endBtn,
            {
              borderColor: colors.danger,
              borderRadius: radius.pill,
              opacity: pressed ? 0.85 : 1,
            },
          ]}>
          {loading ? (
            <ActivityIndicator color={colors.danger} />
          ) : (
            <View style={styles.endContent}>
              <Icon name="power-outline" size={20} color={colors.danger} />
              <Text style={[styles.endText, { color: colors.danger }]}>
                Akhiri Sesi Sekarang
              </Text>
            </View>
          )}
        </Pressable>
      </FadeInView>
    </CollapsibleScreen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', paddingVertical: 24 },
  heroIcon: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  heroTitle: { fontSize: 18, fontWeight: '800' },
  heroDesc: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  itemIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  itemText: { flex: 1 },
  itemTitle: { fontSize: 15, fontWeight: '700' },
  itemDesc: { fontSize: 13, marginTop: 2, lineHeight: 19 },
  endBtn: {
    height: 52,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  endContent: { flexDirection: 'row', alignItems: 'center' },
  endText: { fontSize: 16, fontWeight: '700', marginLeft: 8 },
});
