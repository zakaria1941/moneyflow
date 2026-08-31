import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AmountText } from '@/components/ui/amount-text';
import { Spacing } from '@/constants/theme';
import { CurrencyCode } from '@/types';

interface BalanceSummaryCardProps {
  totalBalance: number;
  currency: CurrencyCode;
  accountCount: number;
}

/** The Dashboard's hero number — deliberately not wrapped in a Card, so it reads as the
 *  page's headline rather than one box among several. */
export function BalanceSummaryCard({ totalBalance, currency, accountCount }: BalanceSummaryCardProps) {
  return (
    <View style={styles.container}>
      <ThemedText type="sectionTitle">Total Balance</ThemedText>
      <AmountText amount={totalBalance} currency={currency} size={40} colored={false} />
      {accountCount > 0 ? (
        <ThemedText type="caption">
          Across {accountCount} {accountCount === 1 ? 'account' : 'accounts'}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.xs,
  },
});
