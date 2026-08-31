import { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AmountText } from '@/components/ui/amount-text';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import { CategorySpendingRow } from '@/features/reports/components/category-spending-row';
import { useCategoriesStore } from '@/stores/categories-store';
import { useProfileStore } from '@/stores/profile-store';
import { useTransactionsStore } from '@/stores/transactions-store';
import { currentMonthKey, formatMonthLabel } from '@/utils/date';
import { getIncomeVsExpense, getSpendingByCategory } from '@/utils/reports';

export function ReportsScreen() {
  const transactions = useTransactionsStore((s) => s.transactions);
  const transactionsLoading = useTransactionsStore((s) => s.isLoading);
  const categories = useCategoriesStore((s) => s.categories);
  const categoriesLoading = useCategoriesStore((s) => s.isLoading);
  const currency = useProfileStore((s) => s.profile?.currency ?? 'USD');

  const month = currentMonthKey();
  const isLoading = (transactionsLoading || categoriesLoading) && transactions.length === 0;

  const { income, expense } = useMemo(() => getIncomeVsExpense(transactions, month), [transactions, month]);
  const net = income - expense;

  const categorySpending = useMemo(
    () => getSpendingByCategory(transactions, categories, month),
    [transactions, categories, month]
  );
  const maxCategoryAmount = categorySpending[0]?.amount ?? 0;

  if (isLoading) {
    return (
      <Screen>
        <View style={styles.centered}>
          <ActivityIndicator />
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <View style={styles.content}>
        <ThemedText type="title">Reports</ThemedText>
        <ThemedText style={styles.monthLabel}>{formatMonthLabel(month)}</ThemedText>

        <Card style={styles.overviewCard}>
          <ThemedText style={styles.netLabel}>Net this month</ThemedText>
          <AmountText amount={net} currency={currency} size={36} />
          <View style={styles.overviewRow}>
            <View>
              <ThemedText style={styles.overviewLabel}>Income</ThemedText>
              <AmountText amount={income} currency={currency} size={18} />
            </View>
            <View style={styles.overviewRight}>
              <ThemedText style={styles.overviewLabel}>Spending</ThemedText>
              <AmountText amount={-expense} currency={currency} size={18} />
            </View>
          </View>
        </Card>

        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
          Spending by Category
        </ThemedText>
        {categorySpending.length === 0 ? (
          <Card>
            <EmptyState title="No spending yet" message="Expense transactions with a category will show up here." />
          </Card>
        ) : (
          <Card style={styles.categoryCard}>
            {categorySpending.map((entry, index) => (
              <CategorySpendingRow
                key={entry.categoryId}
                categoryName={entry.categoryName}
                amount={entry.amount}
                currency={currency}
                percentage={maxCategoryAmount > 0 ? (entry.amount / maxCategoryAmount) * 100 : 0}
                isLast={index === categorySpending.length - 1}
              />
            ))}
          </Card>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  monthLabel: {
    opacity: 0.6,
    marginTop: -Spacing.sm,
  },
  overviewCard: {
    gap: Spacing.xs,
  },
  netLabel: {
    opacity: 0.6,
  },
  overviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
  },
  overviewRight: {
    alignItems: 'flex-end',
  },
  overviewLabel: {
    opacity: 0.6,
    fontSize: 13,
  },
  sectionTitle: {
    marginLeft: Spacing.xs,
  },
  categoryCard: {
    paddingVertical: Spacing.xs,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
