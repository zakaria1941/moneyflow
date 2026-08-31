import { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

interface ListRowProps {
  title: string;
  subtitle?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  onPress?: () => void;
  /** Drops the trailing divider — set on the last row in a card/section. */
  isLast?: boolean;
}

export function ListRow({ title, subtitle, leading, trailing, onPress, isLast }: ListRowProps) {
  const border = useThemeColor({}, 'border');

  const content = (
    <View
      style={[
        styles.row,
        { borderBottomColor: border, borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth },
      ]}>
      {leading ? <View style={styles.leading}>{leading}</View> : null}
      <View style={styles.textContainer}>
        <ThemedText type="defaultSemiBold" numberOfLines={1}>
          {title}
        </ThemedText>
        {subtitle ? (
          <ThemedText type="default" style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </ThemedText>
        ) : null}
      </View>
      {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm + 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: Spacing.sm,
  },
  leading: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  subtitle: {
    fontSize: 13,
    opacity: 0.6,
  },
  trailing: {
    alignItems: 'flex-end',
  },
  pressed: {
    opacity: 0.6,
  },
});
