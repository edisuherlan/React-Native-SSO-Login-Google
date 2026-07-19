import React, { useRef } from 'react';
import {
  Animated,
  GestureResponderEvent,
  Pressable,
  ViewStyle,
} from 'react-native';

interface Props {
  children: React.ReactNode;
  onPress?: (e: GestureResponderEvent) => void;
  style?: ViewStyle | ViewStyle[];
  disabled?: boolean;
  scaleTo?: number;
}

/**
 * Wrapper Pressable dengan animasi skala saat ditekan (efek tactile modern).
 */
export default function PressableScale({
  children,
  onPress,
  style,
  disabled,
  scaleTo = 0.97,
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const animate = (to: number) =>
    Animated.spring(scale, {
      toValue: to,
      friction: 7,
      tension: 120,
      useNativeDriver: true,
    }).start();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      onPressIn={() => animate(scaleTo)}
      onPressOut={() => animate(1)}>
      <Animated.View style={[style, { transform: [{ scale }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
