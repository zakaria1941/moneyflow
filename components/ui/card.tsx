import { PropsWithChildren } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

import { Elevation, Radii, Spacing } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';

type CardProps = PropsWithChildren<{ style?: ViewStyle }>;

export function Card({ children, style }: CardProps) {
  const backgroundColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  // The shadow is tuned for light backgrounds and barely reads on dark ones anyway, so
  // dark mode leans on the card/border color step alone for separation.
  const scheme = useColorScheme() ?? 'light';

  return (
    <View style={[styles.card, { backgroundColor, borderColor }, scheme === 'light' ? Elevation.card : null, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
  },
});
