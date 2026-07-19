import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme, accents } from '../theme/theme';
import CollapsibleScreen from '../components/CollapsibleScreen';
import Card from '../components/Card';
import FadeInView from '../components/FadeInView';
import { SkeletonRowCard } from '../components/Skeleton';

interface ActivityItem {
  key: string;
  title: string;
  desc: string;
  icon: string;
  color: string;
  time: string;
}

const ITEMS: ActivityItem[] = [
  {
    key: '1',
    title: 'Masuk via Google',
    desc: 'Autentikasi SSO berhasil',
    icon: 'log-in-outline',
    color: accents.cyan,
    time: 'Baru saja',
  },
  {
    key: '2',
    title: 'Sesi dibuat',
    desc: 'Sesi lokal aktif selama 14 hari',
    icon: 'time-outline',
    color: accents.magenta,
    time: 'Baru saja',
  },
  {
    key: '3',
    title: 'Profil disinkronkan',
    desc: 'Data disimpan ke Firestore',
    icon: 'cloud-done-outline',
    color: accents.lime,
    time: 'Baru saja',
  },
  {
    key: '4',
    title: 'Perangkat terhubung',
    desc: 'Sesi terenkripsi di penyimpanan aman',
    icon: 'phone-portrait-outline',
    color: accents.purple,
    time: 'Baru saja',
  },
];

export default function ActivityScreen() {
  const { colors, radius } = useTheme();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(t);
  }, []);

  const onRefresh = async () => {
    setLoading(true);
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 900));
    setLoading(false);
  };

  return (
    <CollapsibleScreen subtitle="Riwayat" title="Aktivitas" onRefresh={onRefresh}>
      {loading
        ? [0, 1, 2, 3].map((i) => <SkeletonRowCard key={i} />)
        : ITEMS.map((item, i) => (
            <FadeInView key={item.key} delay={60 + i * 90}>
              <Card style={styles.item}>
                <View
                  style={[
                    styles.iconWrap,
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
                <Text style={[styles.itemTime, { color: colors.textMuted }]}>
                  {item.time}
                </Text>
              </Card>
            </FadeInView>
          ))}
    </CollapsibleScreen>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  iconWrap: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  itemText: { flex: 1 },
  itemTitle: { fontSize: 15, fontWeight: '700' },
  itemDesc: { fontSize: 13, marginTop: 2 },
  itemTime: { fontSize: 12, fontWeight: '500', marginLeft: 8 },
});
