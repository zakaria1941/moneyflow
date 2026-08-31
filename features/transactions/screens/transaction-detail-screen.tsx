import { router } from 'expo-router';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AmountText } from '@/components/ui/amount-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import { useAccountsStore } from '@/stores/accounts-store';
import { useCategoriesStore } from '@/stores/categories-store';
import { usePayeesStore } from '@/stores/payees-store';
import { useTransactionsStore } from '@/stores/transactions-store';
import { formatDateHeading } from '@/utils/date';

interface TransactionDetailScreenProps {
  transactionId: string;
}

export function TransactionDetailScreen({ transactionId }: TransactionDetailScreenProps) {
  const transaction = useTransactionsStore((s) => s.transactions.find((t) => t.id === transactionId));
  const transactionsLoading = useTransactionsStore((s) => s.isLoading);
  const transactionsError = useTransactionsStore((s) => s.error);
  const loadTransactions = useTransactionsStore((s) => s.load);
  const removeTransaction = useTransactionsStore((s) => s.removeTransaction);
  const accounts = useAccountsStore((s) => s.accounts);
  const categories = useCategoriesStore((s) => s.categories);
  const payees = usePayeesStore((s) => s.payees);

  if (!transaction) {
    return (
      <Screen>
        <View style={styles.centered}>
          {transactionsLoading ? (
            <ActivityIndicator />
          ) : transactionsError ? (
            <EmptyState title="Couldn't load this transaction" message={transactionsError} action={{ label: 'Retry', onPress: loadTransactions }} />
          ) : (
            <EmptyState title="Transaction not found" message="This transaction may have been deleted." />
          )}
        </View>
      </Screen>
    );
  }

  const account = accounts.find((a) => a.id === transaction.accountId);
  const category = categories.find((c) => c.id === transaction.categoryId);
  const payee = payees.find((p) => p.id === transaction.payeeId);

  const handleDelete = () => {
    Alert.alert(
      'Delete this transaction?',
      "This removes it and reverses its effect on the account balance. This can't be undone.",
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            removeTransaction(transaction.id).then(() => router.back());
          },
        },
      ]
    );
  };

  return (
    <Screen scroll>
      <View style={styles.content}>
        <ThemedText style={styles.payeeLabel}>{payee?.name ?? 'Unknown payee'}</ThemedText>
        <AmountText amount={transaction.amount} currency={account?.currency ?? 'USD'} showSign size={40} />

        <Card style={styles.card}>
          <Row label="Date" value={formatDateHeading(transaction.date)} />
          <Row label="Account" value={account?.name ?? 'Unknown account'} />
          <Row label="Category" value={category?.name ?? 'Uncategorized'} />
          {transaction.memo ? <Row label="Memo" value={transaction.memo} /> : null}
        </Card>

        <View style={styles.actions}>
          <View style={styles.actionButton}>
            <Button
              title="Edit"
              variant="secondary"
              onPress={() => router.push(`/transaction/${transaction.id}/edit`)}
            />
          </View>
          <View style={styles.actionButton}>
            <Button title="Delete" variant="secondary" onPress={handleDelete} />
          </View>
        </View>
      </View>
    </Screen>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <ThemedText style={styles.rowLabel}>{label}</ThemedText>
      <ThemedText type="defaultSemiBold">{value}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  payeeLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  card: {
    gap: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rowLabel: {
    opacity: 0.6,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
