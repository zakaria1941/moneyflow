import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ProgressBar } from '@/components/ui/progress-bar';
import { SectionHeader } from '@/components/ui/section-header';
import { Spacing } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Category, CategoryMonth, CurrencyCode, Goal } from '@/types';
import { computeGoalProgress } from '@/utils/budget-math';
import { formatCurrency } from '@/utils/currency';

interface GoalsOverviewCardProps {
  goals: Goal[];
  categories: Category[];
  categoryMonths: CategoryMonth[];
  currency: CurrencyCode;
}

const MAX_GOALS_SHOWN = 4;

export function GoalsOverviewCard({ goals, categories, categoryMonths, currency }: GoalsOverviewCardProps) {
  const tint = useThemeColor({}, 'tint');
  const muted = useThemeColor({}, 'muted');
  const border = useThemeColor({}, 'border');

  // A hidden category's goal is dormant, same as everywhere else it's referenced
  // (Budget, Category Management) — it shouldn't resurface on the Dashboard either.
  const visibleGoals = goals.filter((g) => !categories.find((c) => c.id === g.categoryId)?.hidden);
  const shown = visibleGoals.slice(0, MAX_GOALS_SHOWN);

  return (
    <View style={styles.container}>
      <SectionHeader title="Goals" action={{ label: 'Manage', onPress: () => router.push('/category') }} />
      <Card style={styles.card}>
        {shown.length === 0 ? (
          <EmptyState title="No goals yet" message="Set a goal on a category to track your progress here." />
        ) : (
          shown.map((goal, index) => {
            const category = categories.find((c) => c.id === goal.categoryId);
            const categoryMonth = categoryMonths.find((cm) => cm.categoryId === goal.categoryId);
            const progress = computeGoalProgress(goal, categoryMonth);
            const isLast = index === shown.length - 1;
            return (
              <View
                key={goal.id}
                style={[styles.row, !isLast && { borderBottomColor: border, borderBottomWidth: StyleSheet.hairlineWidth }]}>
                <View style={styles.rowHeader}>
                  <ThemedText type="defaultSemiBold" numberOfLines={1} style={styles.name}>
                    {category?.name ?? 'Unknown category'}
                  </ThemedText>
                  <ThemedText type="caption" style={[styles.percent, { color: tint }]}>
                    {Math.round(progress.fraction * 100)}%
                  </ThemedText>
                </View>
                <ProgressBar fraction={progress.fraction} />
                <ThemedText type="caption" style={{ color: muted }}>
                  {formatCurrency(progress.current, currency)} of {formatCurrency(progress.target, currency)}
                </ThemedText>
              </View>
            );
          })
        )}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  card: {
    paddingVertical: Spacing.xs,
    gap: 0,
  },
  row: {
    paddingVertical: Spacing.sm + 2,
    gap: Spacing.xs,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  name: {
    flex: 1,
  },
  percent: {
    fontWeight: '700',
  },
});
