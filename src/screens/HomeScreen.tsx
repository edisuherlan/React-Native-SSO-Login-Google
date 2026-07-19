import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../auth/authStore';
import { useTheme, accents } from '../theme/theme';
import type { TabScreenNavigation } from '../navigation/types';
import CollapsibleScreen from '../components/CollapsibleScreen';
import Card from '../components/Card';
import Avatar from '../components/Avatar';
import FadeInView from '../components/FadeInView';
import AnimatedBar from '../components/AnimatedBar';
import PressableScale from '../components/PressableScale';
import { Skeleton, SkeletonStatCard } from '../components/Skeleton';

function daysLeft(expiresAt: number | null): number {
  if (!expiresAt) {
    return 0;
  }
  return Math.max(0, Math.ceil((expiresAt - Date.now()) / (24 * 60 * 60 * 1000)));
}

function formatDate(ts: number | null): string {
  if (!ts) {
    return '-';
  }
  return new Date(ts).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

interface Action {
  key: string;
  label: string;
  icon: string;
  color: string;
}

const ACTIONS: Action[] = [
  { key: 'profile', label: 'Profil', icon: 'person-circle-outline', color: accents.cyan },
  { key: 'activity', label: 'Aktivitas', icon: 'pulse-outline', color: accents.magenta },
  { key: 'security', label: 'Keamanan', icon: 'shield-checkmark-outline', color: accents.lime },
  { key: 'help', label: 'Bantuan', icon: 'help-circle-outline', color: accents.purple },
];

export default function HomeScreen() {
  const user = useAuthStore((s) => s.user);
  const expiresAt = useAuthStore((s) => s.sessionExpiresAt);
  const bootstrap = useAuthStore((s) => s.bootstrap);
  const navigation = useNavigation<TabScreenNavigation>();
  const { colors, radius } = useTheme();
  const [loading, setLoading] = useState(true);

  const handleAction = (key: string) => {
    switch (key) {
      case 'profile':
        navigation.navigate('Profil');
        break;
      case 'activity':
        navigation.navigate('Aktivitas');
        break;
      case 'security':
        navigation.navigate('Security');
        break;
      case 'help':
        navigation.navigate('Help');
        break;
    }
  };

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  const remaining = daysLeft(expiresAt);
  const progress = remaining / 14;

  const onRefresh = async () => {
    await bootstrap();
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 600));
  };

  return (
    <CollapsibleScreen
      subtitle="Halo,"
      title={user?.displayName || 'Pengguna'}
      onRefresh={onRefresh}
      right={
        <Avatar
          uri={user?.photoURL}
          name={user?.displayName}
          email={user?.email}
          size={48}
        />
      }>
      {loading ? (
        <View>
          <SkeletonStatCard />
          <View style={styles.skeletonGrid}>
            {[0, 1, 2, 3].map((i) => (
              <Card key={i} style={styles.skeletonTile}>
                <Skeleton width={46} height={46} radius={12} />
                <Skeleton width="70%" height={13} style={styles.mt12} />
              </Card>
            ))}
          </View>
        </View>
      ) : (
        <>
          <FadeInView delay={40}>
            <Card>
              <View style={styles.rowBetween}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>
                  Sesi Aktif
                </Text>
                <Text style={[styles.daysBig, { color: colors.primary }]}>
                  {remaining} <Text style={styles.daysUnit}>hari</Text>
                </Text>
              </View>
              <AnimatedBar progress={progress} />
              <Text style={[styles.note, { color: colors.textMuted }]}>
                Berlaku hingga {formatDate(expiresAt)}. Tetap masuk 14 hari tanpa
                login ulang.
              </Text>
            </Card>
          </FadeInView>

          <FadeInView delay={140}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Aksi Cepat
            </Text>
          </FadeInView>

          <View style={styles.grid}>
            {ACTIONS.map((a, i) => (
              <FadeInView key={a.key} delay={200 + i * 80} style={styles.gridItem}>
                <PressableScale onPress={() => handleAction(a.key)}>
                  <Card style={styles.tile}>
                    <View
                      style={[
                        styles.iconWrap,
                        { backgroundColor: a.color + '1A', borderRadius: radius.md },
                      ]}>
                      <Icon name={a.icon} size={24} color={a.color} />
                    </View>
                    <Text style={[styles.tileLabel, { color: colors.text }]}>
                      {a.label}
                    </Text>
                  </Card>
                </PressableScale>
              </FadeInView>
            ))}
          </View>
        </>
      )}
    </CollapsibleScreen>
  );
}

const styles = StyleSheet.create({
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  daysBig: { fontSize: 26, fontWeight: '800' },
  daysUnit: { fontSize: 14, fontWeight: '600' },
  note: { fontSize: 13, lineHeight: 19, marginTop: 14 },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: { width: '48%', marginTop: 12 },
  tile: { alignItems: 'flex-start' },
  iconWrap: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  tileLabel: { fontSize: 15, fontWeight: '700' },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  skeletonTile: { width: '48%', marginTop: 12, alignItems: 'flex-start' },
  mt12: { marginTop: 12 },
});
