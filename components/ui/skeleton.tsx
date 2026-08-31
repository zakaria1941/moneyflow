import { useEffect, useRef } from 'react';
import { Animated, DimensionValue, ViewStyle } from 'react-native';

import { Radii } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  radius?: number;
  style?: ViewStyle;
}

/** Lightweight pulsing placeholder block for loading states — built on React Native's
 *  own Animated API rather than pulling in an animation library just for this. */
export function Skeleton({ width = '100%', height = 16, radius = Radii.sm, style }: SkeletonProps) {
  const base = useThemeColor({}, 'border');
  const opacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.6, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View style={[{ width, height, borderRadius: radius, backgroundColor: base, opacity }, style]} />
  );
}
