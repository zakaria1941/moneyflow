import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

export type TransactionFormType = 'expense' | 'income';

interface TransactionTypeToggleProps {
  value: TransactionFormType;
  onChange: (type: TransactionFormType) => void;
}

const OPTIONS: { value: TransactionFormType; label: string }[] = [
  { value: 'expense', label: 'Expense' },
  { value: 'income', label: 'Income' },
];

export function TransactionTypeToggle({ value, onChange }: TransactionTypeToggleProps) {
  const tint = useThemeColor({}, 'tint');
  const card = useThemeColor({}, 'card');
  const border = useThemeColor({}, 'border');
  const text = useThemeColor({}, 'text');
  const onTintColor = useThemeColor({}, 'onTint');

  return (
    <View style={styles.container}>
      {OPTIONS.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[styles.segment, { backgroundColor: selected ? tint : card, borderColor: selected ? tint : border }]}>
            <ThemedText style={[styles.label, { color: selected ? onTintColor : text }]}>{option.label}</ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm + 4,
    borderRadius: Radii.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
  },
});
