import React, { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../theme/theme';

interface Props {
  visible: boolean;
  title: string;
  message: string;
  icon?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  tone?: 'danger' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  visible,
  title,
  message,
  icon = 'help-circle',
  confirmLabel = 'Ya',
  cancelLabel = 'Batal',
  loading = false,
  tone = 'danger',
  onConfirm,
  onCancel,
}: Props) {
  const { colors, radius } = useTheme();
  const accent = tone === 'danger' ? colors.danger : colors.primary;

  const backdrop = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;
  const translateY = useRef(new Animated.Value(24)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      backdrop.setValue(0);
      scale.setValue(0.9);
      translateY.setValue(24);
      return;
    }
    Animated.parallel([
      Animated.timing(backdrop, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 7,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        friction: 8,
        tension: 70,
        useNativeDriver: true,
      }),
    ]).start();

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [visible, backdrop, scale, translateY, pulse]);

  const ringScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.18],
  });
  const ringOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 0],
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onCancel}>
      <View style={styles.root}>
        <Animated.View style={[styles.backdrop, { opacity: backdrop }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={loading ? undefined : onCancel} />
        </Animated.View>

        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderRadius: radius.xl,
              opacity: backdrop,
              transform: [{ scale }, { translateY }],
            },
          ]}>
          <View style={styles.iconWrap}>
            <Animated.View
              style={[
                styles.ring,
                {
                  backgroundColor: accent,
                  opacity: ringOpacity,
                  transform: [{ scale: ringScale }],
                },
              ]}
            />
            <View style={[styles.iconCircle, { backgroundColor: accent + '1A' }]}>
              <Icon name={icon} size={34} color={accent} />
            </View>
          </View>

          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.message, { color: colors.textMuted }]}>{message}</Text>

          <View style={styles.actions}>
            <Pressable
              onPress={onCancel}
              disabled={loading}
              style={({ pressed }) => [
                styles.btn,
                styles.cancelBtn,
                {
                  borderColor: colors.border,
                  borderRadius: radius.pill,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}>
              <Text style={[styles.btnText, { color: colors.text }]}>{cancelLabel}</Text>
            </Pressable>

            <Pressable
              onPress={onConfirm}
              disabled={loading}
              style={({ pressed }) => [
                styles.btn,
                {
                  backgroundColor: accent,
                  borderRadius: radius.pill,
                  opacity: pressed || loading ? 0.85 : 1,
                },
              ]}>
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={[styles.btnText, { color: '#FFFFFF' }]}>{confirmLabel}</Text>
              )}
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10,12,18,0.55)',
  },
  card: {
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  ring: {
    position: 'absolute',
    width: 68,
    height: 68,
    borderRadius: 34,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 19, fontWeight: '800', textAlign: 'center' },
  message: {
    fontSize: 14.5,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 8,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 12,
    alignSelf: 'stretch',
  },
  btn: {
    flex: 1,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    borderWidth: 1.5,
  },
  btnText: { fontSize: 15.5, fontWeight: '700' },
});
