import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AmountText } from '@/components/ui/amount-text';
import { Spacing } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { CurrencyCode } from '@/types';

interface TransactionRowProps {
  /** Payee name, already resolved by the caller (including "Unknown payee" fallback). */
  title: string;
  /** e.g. "Groceries · Aug 20" — already composed by the caller. */
  subtitle: string;
  amount: number;
  currency: CurrencyCode;
  onPress?: () => void;
  isLast?: boolean;
}

/** One transaction line, shared by the Dashboard's Recent Transactions, the full
 *  Transactions list, and an account's transaction history — so the same row reads
 *  identically everywhere instead of three screens each formatting it slightly differently. */
export function TransactionRow({ title, subtitle, amount, currency, onPress, isLast }: TransactionRowProps) {
  const border = useThemeColor({}, 'border');

  const content = (
    <View
      style={[styles.row, { borderBottomColor: border, borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth }]}>
      <View style={styles.text}>
        <ThemedText type="defaultSemiBold" numberOfLines={1}>
          {title}
        </ThemedText>
        <ThemedText type="caption" numberOfLines={1} style={styles.subtitle}>
          {subtitle}
        </ThemedText>
      </View>
      <AmountText amount={amount} currency={currency} showSign size={15} />
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed} accessibilityRole="button">
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm + 4,
    gap: Spacing.sm,
  },
  text: {
    flex: 1,
    gap: 2,
  },
  subtitle: {
    opacity: 0.75,
  },
  pressed: {
    opacity: 0.6,
  },
});
