import { StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/ui/empty-state';
import { FinancialMetric } from '@/components/ui/financial-metric';
import { SectionHeader } from '@/components/ui/section-header';
import { Spacing } from '@/constants/theme';
import { CurrencyCode } from '@/types';

interface IncomeSpendingCardProps {
  income: number;
  expense: number;
  currency: CurrencyCode;
  monthLabel: string;
  /** Whether any transaction exists for this month at all — distinguishes a genuine
   *  "no activity yet" month from one that just nets to zero. */
  hasActivity: boolean;
}

export function IncomeSpendingCard({ income, expense, currency, monthLabel, hasActivity }: IncomeSpendingCardProps) {
  return (
    <View style={styles.container}>
      <SectionHeader title={`This Month · ${monthLabel}`} />
      {hasActivity ? (
        <View style={styles.row}>
          <FinancialMetric label="Income" amount={income} currency={currency} colored showSign />
          <FinancialMetric label="Spending" amount={-expense} currency={currency} colored align="right" />
        </View>
      ) : (
        <EmptyState title="No activity yet" message="Income and spending will show up here once you add transactions." />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
