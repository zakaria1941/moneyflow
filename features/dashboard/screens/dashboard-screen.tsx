import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { Skeleton } from '@/components/ui/skeleton';
import { Spacing } from '@/constants/theme';
import { AccountsPreviewList } from '@/features/dashboard/components/accounts-preview-list';
import { BalanceSummaryCard } from '@/features/dashboard/components/balance-summary-card';
import { BudgetOverviewCard } from '@/features/dashboard/components/budget-overview-card';
import { GoalsOverviewCard } from '@/features/dashboard/components/goals-overview-card';
import { IncomeSpendingCard } from '@/features/dashboard/components/income-spending-card';
import { RecentTransactionsList } from '@/features/dashboard/components/recent-transactions-list';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAccountsStore } from '@/stores/accounts-store';
import { useCategoriesStore } from '@/stores/categories-store';
import { usePayeesStore } from '@/stores/payees-store';
import { useProfileStore } from '@/stores/profile-store';
import { useTransactionsStore } from '@/stores/transactions-store';
import { formatMonthLabel } from '@/utils/date';
import { getIncomeVsExpense } from '@/utils/reports';

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export function DashboardScreen() {
  const accounts = useAccountsStore((s) => s.accounts);
  const accountsLoading = useAccountsStore((s) => s.isLoading);
  const accountsError = useAccountsStore((s) => s.error);
  const loadAccounts = useAccountsStore((s) => s.load);
  const totalBalance = useAccountsStore((s) => s.totalBalance());
  const transactions = useTransactionsStore((s) => s.transactions);
  const transactionsLoading = useTransactionsStore((s) => s.isLoading);
  const transactionsError = useTransactionsStore((s) => s.error);
  const loadTransactions = useTransactionsStore((s) => s.load);
  const payees = usePayeesStore((s) => s.payees);
  const categories = useCategoriesStore((s) => s.categories);
  const categoryMonths = useCategoriesStore((s) => s.categoryMonths);
  const goals = useCategoriesStore((s) => s.goals);
  const totalAssigned = useCategoriesStore((s) => s.totalAssigned());
  const totalActivity = useCategoriesStore((s) => s.totalActivity());
  const totalAvailable = useCategoriesStore((s) => s.totalAvailable());
  const selectedMonth = useCategoriesStore((s) => s.selectedMonth);
  const categoriesLoading = useCategoriesStore((s) => s.isLoading);
  const categoriesError = useCategoriesStore((s) => s.error);
  const loadCategories = useCategoriesStore((s) => s.load);
  const profile = useProfileStore((s) => s.profile);
  const border = useThemeColor({}, 'border');

  const currency = profile?.currency ?? 'USD';
  const firstName = profile?.displayName?.split(' ')[0];

  // Gates only the very first paint (before any store has ever resolved), matching the
  // same isLoading-with-no-data-yet pattern already used by Budget/Accounts/Reports —
  // avoids a Dashboard that flashes "$0.00" everywhere before real data arrives, without
  // blocking on every minor refetch (e.g. a month change) once data already exists.
  const isInitialLoading =
    (accountsLoading || transactionsLoading || categoriesLoading) &&
    accounts.length === 0 &&
    transactions.length === 0 &&
    categories.length === 0;

  if (isInitialLoading) {
    return (
      <Screen scroll>
        <DashboardSkeleton />
      </Screen>
    );
  }

  // Same "nothing loaded yet" condition as isInitialLoading above, but for the case where
  // the load actually failed rather than just being slow. Without this, a failed initial
  // Firestore load left the spinner above spinning forever (known Phase 10 limitation) —
  // this gives it a real error state instead, without touching the wider loading architecture.
  const loadError = accountsError ?? transactionsError ?? categoriesError;
  const hasNoDataYet = accounts.length === 0 && transactions.length === 0 && categories.length === 0;

  if (loadError && hasNoDataYet) {
    return (
      <Screen>
        <View style={styles.centered}>
          <EmptyState
            title="Couldn't load your data"
            message={loadError}
            action={{
              label: 'Retry',
              onPress: () => {
                loadAccounts();
                loadTransactions();
                loadCategories();
              },
            }}
          />
        </View>
      </Screen>
    );
  }

  // Same definition Reports uses (utils/reports.ts), reused rather than reimplemented —
  // Dashboard and Reports must never disagree on what "this month's income" means.
  const { income, expense } = getIncomeVsExpense(transactions, selectedMonth);
  const hasMonthActivity = transactions.some((t) => t.date.startsWith(selectedMonth));

  return (
    <Screen scroll>
      <View style={styles.content}>
        <View style={styles.header}>
          <ThemedText type="caption">MoneyFlow</ThemedText>
          <ThemedText type="title">{firstName ? `${greeting()}, ${firstName}` : greeting()}</ThemedText>
        </View>

        <BalanceSummaryCard totalBalance={totalBalance} currency={currency} accountCount={accounts.length} />

        {/* This Month and Budget share one card, split by a hairline, rather than two
           separate boxes — they're both "how am I doing" summaries for the same month. */}
        <Card style={styles.overviewCard}>
          <IncomeSpendingCard
            income={income}
            expense={expense}
            currency={currency}
            monthLabel={formatMonthLabel(selectedMonth)}
            hasActivity={hasMonthActivity}
          />
          <View style={[styles.divider, { backgroundColor: border }]} />
          <BudgetOverviewCard
            totalAssigned={totalAssigned}
            totalActivity={totalActivity}
            totalAvailable={totalAvailable}
            currency={currency}
            monthLabel={formatMonthLabel(selectedMonth)}
          />
        </Card>

        <GoalsOverviewCard goals={goals} categories={categories} categoryMonths={categoryMonths} currency={currency} />
        <AccountsPreviewList accounts={accounts} />
        <RecentTransactionsList transactions={transactions} payees={payees} categories={categories} currency={currency} />
      </View>
    </Screen>
  );
}

/** Mirrors the loaded layout's proportions (greeting, hero balance, one summary card)
 *  so nothing jumps around once real data arrives — no flash of "$0.00", no blank screen. */
function DashboardSkeleton() {
  return (
    <View style={styles.content}>
      <View style={styles.header}>
        <Skeleton width={90} height={12} />
        <Skeleton width={180} height={30} style={{ marginTop: 6 }} />
      </View>
      <View style={styles.skeletonBalance}>
        <Skeleton width={110} height={12} />
        <Skeleton width={220} height={40} />
      </View>
      <Card style={styles.overviewCard}>
        <Skeleton width="100%" height={54} />
        <View style={[styles.divider, { backgroundColor: 'transparent' }]} />
        <Skeleton width="100%" height={54} />
      </Card>
      <Skeleton width="100%" height={140} radius={18} />
      <Skeleton width="100%" height={140} radius={18} />
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  header: {
    gap: 2,
  },
  overviewCard: {
    gap: Spacing.md,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  skeletonBalance: {
    gap: Spacing.xs,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
