import { router } from 'expo-router';
import { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { TransactionRow } from '@/components/ui/transaction-row';
import { Spacing } from '@/constants/theme';
import { useAccountsStore } from '@/stores/accounts-store';
import { useCategoriesStore } from '@/stores/categories-store';
import { usePayeesStore } from '@/stores/payees-store';
import { useTransactionsStore } from '@/stores/transactions-store';
import { Transaction } from '@/types';
import { formatDateHeading } from '@/utils/date';

export function TransactionListScreen() {
  const transactions = useTransactionsStore((s) => s.transactions);
  const isLoading = useTransactionsStore((s) => s.isLoading);
  const error = useTransactionsStore((s) => s.error);
  const load = useTransactionsStore((s) => s.load);
  const accounts = useAccountsStore((s) => s.accounts);
  const categories = useCategoriesStore((s) => s.categories);
  const payees = usePayeesStore((s) => s.payees);

  const accountName = (id: string) => accounts.find((a) => a.id === id)?.name ?? 'Unknown account';
  const accountCurrency = (id: string) => accounts.find((a) => a.id === id)?.currency ?? 'USD';
  const categoryName = (id?: string) => categories.find((c) => c.id === id)?.name;
  const payeeName = (id?: string) => payees.find((p) => p.id === id)?.name ?? 'Unknown payee';

  const groups = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    for (const t of transactions) {
      const list = map.get(t.date) ?? [];
      list.push(t);
      map.set(t.date, list);
    }
    return Array.from(map.entries());
  }, [transactions]);

  return (
    <Screen scroll>
      <View style={styles.content}>
        <Button title="Add Transaction" onPress={() => router.push('/transaction/new')} />

        {isLoading && transactions.length === 0 ? (
          <ActivityIndicator style={styles.spinner} />
        ) : error && transactions.length === 0 ? (
          <EmptyState title="Couldn't load your transactions" message={error} action={{ label: 'Retry', onPress: load }} />
        ) : transactions.length === 0 ? (
          <EmptyState
            title="No transactions yet"
            message="Add your first transaction to start tracking your spending."
            action={{ label: 'Add Transaction', onPress: () => router.push('/transaction/new') }}
          />
        ) : (
          groups.map(([date, dayTransactions]) => (
            <View key={date} style={styles.group}>
              <ThemedText type="sectionTitle" style={styles.groupTitle}>
                {formatDateHeading(date)}
              </ThemedText>
              <Card style={styles.groupCard}>
                {dayTransactions.map((transaction, index) => {
                  const category = categoryName(transaction.categoryId);
                  const subtitle = category
                    ? `${category} · ${accountName(transaction.accountId)}`
                    : accountName(transaction.accountId);
                  return (
                    <TransactionRow
                      key={transaction.id}
                      title={payeeName(transaction.payeeId)}
                      subtitle={subtitle}
                      amount={transaction.amount}
                      currency={accountCurrency(transaction.accountId)}
                      onPress={() => router.push(`/transaction/${transaction.id}`)}
                      isLast={index === dayTransactions.length - 1}
                    />
                  );
                })}
              </Card>
            </View>
          ))
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
  spinner: {
    marginTop: Spacing.xl,
  },
  group: {
    gap: Spacing.xs,
  },
  groupTitle: {
    marginLeft: Spacing.xs,
  },
  groupCard: {
    paddingVertical: Spacing.xs,
  },
});
