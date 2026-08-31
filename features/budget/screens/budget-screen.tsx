import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AmountText } from '@/components/ui/amount-text';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import { CategoryRow } from '@/features/budget/components/category-row';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useCategoriesStore } from '@/stores/categories-store';
import { useProfileStore } from '@/stores/profile-store';
import { toMajorUnits, toMinorUnits } from '@/utils/currency';
import { formatMonthLabel } from '@/utils/date';

export function BudgetScreen() {
  const groups = useCategoriesStore((s) => s.groups);
  const categories = useCategoriesStore((s) => s.categories);
  const categoryMonths = useCategoriesStore((s) => s.categoryMonths);
  const goals = useCategoriesStore((s) => s.goals);
  const selectedMonth = useCategoriesStore((s) => s.selectedMonth);
  const isLoading = useCategoriesStore((s) => s.isLoading);
  const totalAssigned = useCategoriesStore((s) => s.totalAssigned());
  const totalAvailable = useCategoriesStore((s) => s.totalAvailable());
  const assign = useCategoriesStore((s) => s.assign);
  const nextMonth = useCategoriesStore((s) => s.nextMonth);
  const previousMonth = useCategoriesStore((s) => s.previousMonth);
  const currency = useProfileStore((s) => s.profile?.currency ?? 'USD');
  const muted = useThemeColor({}, 'muted');
  const negative = useThemeColor({}, 'negative');

  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [draftAmount, setDraftAmount] = useState('');
  const [draftError, setDraftError] = useState<string | undefined>();
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingMonth, setIsChangingMonth] = useState(false);
  const [monthError, setMonthError] = useState<string | undefined>();

  const categoryMonthFor = (categoryId: string) => categoryMonths.find((c) => c.categoryId === categoryId);
  const goalFor = (categoryId: string) => goals.find((g) => g.categoryId === categoryId);

  const groupedData = useMemo(() => {
    return [...groups]
      .sort((a, b) => a.order - b.order)
      .map((group) => {
        const groupCategories = categories
          .filter((c) => c.groupId === group.id && !c.hidden)
          .sort((a, b) => a.order - b.order);
        const totals = groupCategories.reduce(
          (acc, c) => {
            const cm = categoryMonths.find((x) => x.categoryId === c.id);
            return {
              assigned: acc.assigned + (cm?.assigned ?? 0),
              available: acc.available + (cm?.available ?? 0),
            };
          },
          { assigned: 0, available: 0 }
        );
        return { group, categories: groupCategories, totals };
      });
  }, [groups, categories, categoryMonths]);

  const startEdit = (categoryId: string) => {
    const current = categoryMonthFor(categoryId)?.assigned ?? 0;
    setEditingCategoryId(categoryId);
    setDraftAmount(toMajorUnits(current).toFixed(2));
    setDraftError(undefined);
  };

  const cancelEdit = () => {
    setEditingCategoryId(null);
    setDraftError(undefined);
  };

  const saveEdit = async () => {
    if (!editingCategoryId) return;
    const normalized = draftAmount.trim().replace(/,/g, '');
    const amount = Number(normalized);
    if (normalized === '' || Number.isNaN(amount) || amount < 0) {
      setDraftError('Enter an amount of 0 or more.');
      return;
    }
    setIsSaving(true);
    try {
      await assign(editingCategoryId, toMinorUnits(amount));
      setEditingCategoryId(null);
      setDraftError(undefined);
    } catch (err) {
      setDraftError(err instanceof Error ? err.message : 'Could not save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const changeMonth = async (direction: 'previous' | 'next') => {
    setIsChangingMonth(true);
    setMonthError(undefined);
    try {
      await (direction === 'next' ? nextMonth() : previousMonth());
    } catch (err) {
      setMonthError(err instanceof Error ? err.message : 'Could not load that month. Please try again.');
    } finally {
      setIsChangingMonth(false);
    }
  };

  if (isLoading && groups.length === 0) {
    return (
      <Screen>
        <View style={styles.centered}>
          <ActivityIndicator />
        </View>
      </Screen>
    );
  }

  if (groups.length === 0) {
    return (
      <Screen>
        <View style={styles.centered}>
          <EmptyState title="No budget yet" message="Categories will show up here once they're set up." />
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <ThemedText type="title">Budget</ThemedText>
          <ThemedText onPress={() => router.push('/category')} style={styles.link}>
            Manage
          </ThemedText>
        </View>

        <View style={styles.monthNav}>
          <Pressable onPress={() => changeMonth('previous')} disabled={isChangingMonth} hitSlop={8} style={styles.monthArrow}>
            <Ionicons name="chevron-back" size={20} color={muted} />
          </Pressable>
          <ThemedText style={styles.monthLabel}>{formatMonthLabel(selectedMonth)}</ThemedText>
          <Pressable onPress={() => changeMonth('next')} disabled={isChangingMonth} hitSlop={8} style={styles.monthArrow}>
            <Ionicons name="chevron-forward" size={20} color={muted} />
          </Pressable>
        </View>
        {monthError ? <ThemedText style={{ color: negative }}>{monthError}</ThemedText> : null}

        <Card style={styles.totalsCard}>
          <View style={styles.totalsRow}>
            <View>
              <ThemedText style={styles.totalLabel}>Assigned</ThemedText>
              <AmountText amount={totalAssigned} currency={currency} colored={false} size={22} />
            </View>
            <View style={styles.totalsRight}>
              <ThemedText style={styles.totalLabel}>Available</ThemedText>
              <AmountText amount={totalAvailable} currency={currency} size={22} />
            </View>
          </View>
        </Card>

        {groupedData.map(({ group, categories: groupCategories, totals }) => (
          <View key={group.id} style={styles.group}>
            <View style={styles.groupHeader}>
              <ThemedText type="defaultSemiBold" numberOfLines={1} style={styles.groupName}>
                {group.name}
              </ThemedText>
              <View style={styles.groupTotals}>
                <View style={styles.groupMetric}>
                  <ThemedText style={styles.metricLabel}>Assigned</ThemedText>
                  <AmountText amount={totals.assigned} currency={currency} colored={false} size={13} />
                </View>
                <View style={[styles.groupMetric, styles.groupMetricEnd]}>
                  <ThemedText style={styles.metricLabel}>Available</ThemedText>
                  <AmountText amount={totals.available} currency={currency} size={13} />
                </View>
              </View>
            </View>
            <Card style={styles.groupCard}>
              {groupCategories.length === 0 ? (
                <ThemedText style={styles.emptyGroup}>No categories in this group.</ThemedText>
              ) : (
                groupCategories.map((category, index) => (
                  <CategoryRow
                    key={category.id}
                    category={category}
                    categoryMonth={categoryMonthFor(category.id)}
                    currency={currency}
                    isEditing={editingCategoryId === category.id}
                    isLast={index === groupCategories.length - 1}
                    draftAmount={draftAmount}
                    draftError={editingCategoryId === category.id ? draftError : undefined}
                    isSaving={isSaving}
                    onStartEdit={() => startEdit(category.id)}
                    onChangeDraft={setDraftAmount}
                    onSave={saveEdit}
                    onCancel={cancelEdit}
                    goal={goalFor(category.id)}
                  />
                ))
              )}
            </Card>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  link: {
    opacity: 0.6,
    fontSize: 13,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    marginTop: -Spacing.sm,
  },
  monthArrow: {
    padding: Spacing.xs,
  },
  monthLabel: {
    opacity: 0.6,
    minWidth: 140,
    textAlign: 'center',
  },
  totalsCard: {
    gap: Spacing.xs,
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalsRight: {
    alignItems: 'flex-end',
  },
  totalLabel: {
    opacity: 0.6,
    fontSize: 13,
  },
  group: {
    gap: Spacing.xs,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xs,
    gap: Spacing.sm,
  },
  groupName: {
    flexShrink: 1,
  },
  groupTotals: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  groupMetric: {
    alignItems: 'flex-start',
  },
  groupMetricEnd: {
    alignItems: 'flex-end',
  },
  metricLabel: {
    fontSize: 11,
    opacity: 0.6,
  },
  groupCard: {
    paddingVertical: Spacing.xs,
  },
  emptyGroup: {
    opacity: 0.6,
    paddingVertical: Spacing.sm,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
