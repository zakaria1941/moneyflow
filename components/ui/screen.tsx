import { PropsWithChildren } from 'react';
import { ScrollView, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Spacing } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

type ScreenProps = PropsWithChildren<{
  scroll?: boolean;
  padded?: boolean;
  style?: ViewStyle;
}>;

/** Safe-area + padding wrapper every screen renders into. */
export function Screen({ children, style, scroll = false, padded = true }: ScreenProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const insets = useSafeAreaInsets();
  const horizontalPadding = padded ? Spacing.md : 0;

  if (scroll) {
    return (
      <ScrollView
        style={{ flex: 1, backgroundColor }}
        contentContainerStyle={[
          { paddingTop: insets.top, paddingHorizontal: horizontalPadding, paddingBottom: Spacing.xl, flexGrow: 1 },
          style,
        ]}>
        {children}
      </ScrollView>
    );
  }

  return (
    <View style={[{ flex: 1, backgroundColor, paddingTop: insets.top, paddingHorizontal: horizontalPadding }, style]}>
      {children}
    </View>
  );
}
