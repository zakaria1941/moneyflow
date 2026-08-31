import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { FinancialMetric } from '@/components/ui/financial-metric';
import { SectionHeader } from '@/components/ui/section-header';
import { Spacing } from '@/constants/theme';
import { CurrencyCode } from '@/types';

interface BudgetOverviewCardProps {
  totalAssigned: number;
  totalActivity: number;
  totalAvailable: number;
  currency: CurrencyCode;
  monthLabel: string;
}

export function BudgetOverviewCard({
  totalAssigned,
  totalActivity,
  totalAvailable,
  currency,
  monthLabel,
}: BudgetOverviewCardProps) {
  return (
    <View style={styles.container}>
      <SectionHeader title={`Budget · ${monthLabel}`} action={{ label: 'See budget', onPress: () => router.push('/budget') }} />
      <View style={styles.row}>
        <FinancialMetric label="Assigned" amount={totalAssigned} currency={currency} />
        <FinancialMetric label="Activity" amount={totalActivity} currency={currency} />
        {/* The number that answers "what can I still spend" — the one that matters most
           in this row, so it gets color and a larger size the other two don't. */}
        <FinancialMetric
          label="Available"
          amount={totalAvailable}
          currency={currency}
          colored
          emphasis="strong"
          align="right"
        />
      </View>
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
