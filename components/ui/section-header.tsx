import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

interface SectionHeaderProps {
  title: string;
  action?: { label: string; onPress: () => void };
}

/** Small-caps label used to group a section of the screen ("THIS MONTH", "GOALS") in
 *  place of wrapping every group in its own bordered card. */
export function SectionHeader({ title, action }: SectionHeaderProps) {
  const tint = useThemeColor({}, 'tint');

  return (
    <View style={styles.row}>
      <ThemedText type="sectionTitle">{title}</ThemedText>
      {action ? (
        <ThemedText
          type="caption"
          style={[styles.action, { color: tint }]}
          onPress={action.onPress}
          accessibilityRole="button">
          {action.label}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  action: {
    fontWeight: '700',
  },
});
