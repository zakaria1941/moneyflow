import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AmountText } from '@/components/ui/amount-text';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Spacing } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { CurrencyCode } from '@/types';

interface CategorySpendingRowProps {
  categoryName: string;
  amount: number;
  currency: CurrencyCode;
  /** 0-100, this category's spending relative to the largest category this month */
  percentage: number;
  isLast?: boolean;
}

export function CategorySpendingRow({ categoryName, amount, currency, percentage, isLast }: CategorySpendingRowProps) {
  const border = useThemeColor({}, 'border');

  return (
    <View
      style={[styles.row, { borderBottomColor: border, borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth }]}>
      <View style={styles.header}>
        <ThemedText type="defaultSemiBold" numberOfLines={1} style={styles.name}>
          {categoryName}
        </ThemedText>
        <AmountText amount={amount} currency={currency} colored={false} size={14} />
      </View>
      <ProgressBar fraction={percentage / 100} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: Spacing.sm + 2,
    gap: Spacing.xs,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  name: {
    flexShrink: 1,
  },
});
