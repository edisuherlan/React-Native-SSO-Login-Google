import React, { useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import GradientBackground from './GradientBackground';
import { useTheme } from '../theme/theme';

interface Props {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  onBack?: () => void;
  onRefresh?: () => Promise<void> | void;
  children: React.ReactNode;
}

const HEADER_MAX = 180;

export default function CollapsibleScreen({
  title,
  subtitle,
  right,
  onBack,
  onRefresh,
  children,
}: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [refreshing, setRefreshing] = useState(false);

  const HEADER_MIN = insets.top + 64;
  const scrollRange = HEADER_MAX - HEADER_MIN;

  const headerHeight = scrollY.interpolate({
    inputRange: [0, scrollRange],
    outputRange: [HEADER_MAX, HEADER_MIN],
    extrapolate: 'clamp',
  });
  const titleSize = scrollY.interpolate({
    inputRange: [0, scrollRange],
    outputRange: [27, 20],
    extrapolate: 'clamp',
  });
  const subtitleOpacity = scrollY.interpolate({
    inputRange: [0, scrollRange * 0.6],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  const rightScale = scrollY.interpolate({
    inputRange: [0, scrollRange],
    outputRange: [1, 0.8],
    extrapolate: 'clamp',
  });

  const handleRefresh = async () => {
    if (!onRefresh) {
      return;
    }
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Animated.View style={[styles.header, { height: headerHeight }]}>
        <GradientBackground style={styles.gradient}>
          <View style={[styles.headerInner, { paddingTop: insets.top + 8 }]}>
            {onBack ? (
              <Pressable onPress={onBack} hitSlop={12} style={styles.backBtn}>
                <Icon name="chevron-back" size={26} color="#FFFFFF" />
              </Pressable>
            ) : null}
            <View style={styles.textCol}>
              {subtitle ? (
                <Animated.Text
                  style={[styles.subtitle, { opacity: subtitleOpacity }]}>
                  {subtitle}
                </Animated.Text>
              ) : null}
              <Animated.Text
                numberOfLines={1}
                style={[styles.title, { fontSize: titleSize }]}>
                {title}
              </Animated.Text>
            </View>
            {right ? (
              <Animated.View style={{ transform: [{ scale: rightScale }] }}>
                {right}
              </Animated.View>
            ) : null}
          </View>
        </GradientBackground>
      </Animated.View>

      <Animated.ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false },
        )}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
              progressViewOffset={8}
            />
          ) : undefined
        }>
        <View style={styles.inner}>{children}</View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    overflow: 'hidden',
  },
  gradient: { flex: 1 },
  headerInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  backBtn: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
    marginLeft: -6,
  },
  textCol: { flex: 1 },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500',
  },
  title: {
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.4,
    marginTop: 2,
  },
  scroll: { flex: 1, marginTop: -40 },
  content: { paddingBottom: 24 },
  inner: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    paddingHorizontal: 20,
  },
});
