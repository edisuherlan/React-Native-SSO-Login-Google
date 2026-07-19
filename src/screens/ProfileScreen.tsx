import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../auth/authStore';
import { useTheme } from '../theme/theme';
import type { RootNavigation } from '../navigation/types';
import CollapsibleScreen from '../components/CollapsibleScreen';
import Card from '../components/Card';
import Avatar from '../components/Avatar';
import FadeInView from '../components/FadeInView';
import ConfirmModal from '../components/ConfirmModal';

interface Row {
  key: string;
  label: string;
  value?: string;
  icon: string;
  onPress?: () => void;
}

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const bootstrap = useAuthStore((s) => s.bootstrap);
  const navigation = useNavigation<RootNavigation>();
  const { colors, radius, isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);

  const onLogout = async () => {
    setLoading(true);
    await logout();
    setLoading(false);
    setConfirmVisible(false);
  };

  const onRefresh = async () => {
    await bootstrap();
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 500));
  };

  const rows: Row[] = [
    { key: 'theme', label: 'Tema', value: isDark ? 'Gelap' : 'Terang', icon: 'contrast-outline' },
    { key: 'provider', label: 'Metode Masuk', value: 'Google', icon: 'logo-google' },
    {
      key: 'about',
      label: 'Tentang Aplikasi',
      icon: 'information-circle-outline',
      onPress: () => navigation.navigate('About'),
    },
    { key: 'version', label: 'Versi', value: '1.0.0', icon: 'pricetag-outline' },
  ];

  return (
    <CollapsibleScreen subtitle="Akun" title="Profil" onRefresh={onRefresh}>
      <FadeInView delay={40}>
        <Card style={styles.profileCard}>
          <Avatar
            uri={user?.photoURL}
            name={user?.displayName}
            email={user?.email}
            size={88}
          />
          <Text style={[styles.name, { color: colors.text }]}>
            {user?.displayName || 'Pengguna'}
          </Text>
          <Text style={[styles.email, { color: colors.textMuted }]}>
            {user?.email}
          </Text>
          <View
            style={[
              styles.badge,
              { backgroundColor: colors.success + '1A', borderRadius: radius.pill },
            ]}>
            <View style={[styles.dot, { backgroundColor: colors.success }]} />
            <Text style={[styles.badgeText, { color: colors.success }]}>
              Terhubung via Google
            </Text>
          </View>
        </Card>
      </FadeInView>

      <FadeInView delay={130}>
        <Card padded={false} style={styles.listCard}>
          {rows.map((row, i) => (
            <Pressable
              key={row.key}
              onPress={row.onPress}
              disabled={!row.onPress}
              style={({ pressed }) => [
                styles.row,
                { opacity: pressed && row.onPress ? 0.6 : 1 },
                i < rows.length - 1 && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: colors.border,
                },
              ]}>
              <View
                style={[
                  styles.rowIcon,
                  { backgroundColor: colors.surfaceAlt, borderRadius: radius.sm },
                ]}>
                <Icon name={row.icon} size={18} color={colors.primary} />
              </View>
              <Text style={[styles.rowLabel, { color: colors.text }]}>
                {row.label}
              </Text>
              {row.value ? (
                <Text style={[styles.rowValue, { color: colors.textMuted }]}>
                  {row.value}
                </Text>
              ) : null}
              {row.onPress ? (
                <Icon
                  name="chevron-forward"
                  size={18}
                  color={colors.textMuted}
                  style={styles.rowChevron}
                />
              ) : null}
            </Pressable>
          ))}
        </Card>
      </FadeInView>

      <FadeInView delay={220}>
        <Pressable
          onPress={() => setConfirmVisible(true)}
          disabled={loading}
          style={({ pressed }) => [
            styles.logout,
            {
              borderColor: colors.danger,
              borderRadius: radius.pill,
              opacity: pressed ? 0.85 : 1,
            },
          ]}>
          <View style={styles.logoutContent}>
            <Icon name="log-out-outline" size={20} color={colors.danger} />
            <Text style={[styles.logoutText, { color: colors.danger }]}>
              Keluar
            </Text>
          </View>
        </Pressable>
      </FadeInView>

      <ConfirmModal
        visible={confirmVisible}
        icon="log-out-outline"
        title="Keluar dari akun?"
        message="Sesi lokal kamu akan dihapus dan kamu perlu masuk kembali dengan Google."
        confirmLabel="Ya, keluar"
        cancelLabel="Batal"
        loading={loading}
        tone="danger"
        onConfirm={onLogout}
        onCancel={() => setConfirmVisible(false)}
      />
    </CollapsibleScreen>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    alignItems: 'center',
    paddingTop: 24,
  },
  name: { fontSize: 18, fontWeight: '700', marginTop: 12 },
  email: { fontSize: 14, marginTop: 2 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 14,
  },
  dot: { width: 7, height: 7, borderRadius: 4, marginRight: 7 },
  badgeText: { fontSize: 13, fontWeight: '600' },
  listCard: {
    marginTop: 16,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowIcon: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowLabel: { flex: 1, fontSize: 15, fontWeight: '600' },
  rowValue: { fontSize: 14, fontWeight: '500' },
  rowChevron: { marginLeft: 8 },
  logout: {
    height: 52,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  logoutContent: { flexDirection: 'row', alignItems: 'center' },
  logoutText: { fontSize: 16, fontWeight: '700', marginLeft: 8 },
});
