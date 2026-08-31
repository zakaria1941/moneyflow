import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AmountText } from '@/components/ui/amount-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { TransactionRow } from '@/components/ui/transaction-row';
import { Spacing } from '@/constants/theme';
import { ACCOUNT_TYPE_ICON, ACCOUNT_TYPE_LABEL } from '@/features/accounts/constants';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAccountsStore } from '@/stores/accounts-store';
import { useCategoriesStore } from '@/stores/categories-store';
import { usePayeesStore } from '@/stores/payees-store';
import { useTransactionsStore } from '@/stores/transactions-store';
import { formatDateShort } from '@/utils/date';

interface AccountDetailScreenProps {
  accountId: string;
}

export function AccountDetailScreen({ accountId }: AccountDetailScreenProps) {
  const account = useAccountsStore((s) => s.accounts.find((a) => a.id === accountId));
  const accountsLoading = useAccountsStore((s) => s.isLoading);
  const archiveAccount = useAccountsStore((s) => s.archiveAccount);
  const transactions = useTransactionsStore((s) => s.transactions);
  const transactionsLoading = useTransactionsStore((s) => s.isLoading);
  const payees = usePayeesStore((s) => s.payees);
  const categories = useCategoriesStore((s) => s.categories);
  const icon = useThemeColor({}, 'icon');

  if (!account) {
    return (
      <Screen>
        <View style={styles.centered}>
          {accountsLoading ? (
            <ActivityIndicator />
          ) : (
            <EmptyState title="Account not found" message="This account may have been closed." />
          )}
        </View>
      </Screen>
    );
  }

  const accountTransactions = transactions
    .filter((t) => t.accountId === accountId)
    .sort((a, b) => b.date.localeCompare(a.date));

  const payeeName = (payeeId?: string) => payees.find((p) => p.id === payeeId)?.name ?? 'Unknown';
  const categoryName = (categoryId?: string) => categories.find((c) => c.id === categoryId)?.name;

  const handleClose = () => {
    Alert.alert(
      `Close ${account.name}?`,
      "This account will be hidden from your accounts list. Its transaction history is preserved and this can't be undone from here.",
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Close Account',
          style: 'destructive',
          onPress: () => {
            archiveAccount(account.id).then(() => router.back());
          },
        },
      ]
    );
  };

  return (
    <Screen scroll>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Ionicons name={ACCOUNT_TYPE_ICON[account.type]} size={20} color={icon} />
          <ThemedText type="defaultSemiBold" style={styles.typeLabel}>
            {ACCOUNT_TYPE_LABEL[account.type]}
          </ThemedText>
        </View>
        <ThemedText type="title">{account.name}</ThemedText>
        <AmountText amount={account.balance} currency={account.currency} size={40} colored={false} />

        <View style={styles.actions}>
          <View style={styles.actionButton}>
            <Button title="Edit" variant="secondary" onPress={() => router.push(`/account/${account.id}/edit`)} />
          </View>
          <View style={styles.actionButton}>
            <Button title="Close Account" variant="secondary" onPress={handleClose} />
          </View>
        </View>

        <ThemedText type="sectionTitle" style={styles.sectionTitle}>
          Transactions
        </ThemedText>

        {transactionsLoading && accountTransactions.length === 0 ? (
          <ActivityIndicator style={styles.spinner} />
        ) : accountTransactions.length === 0 ? (
          <Card>
            <EmptyState title="No transactions yet" message="Transactions for this account will show up here." />
          </Card>
        ) : (
          <Card style={styles.transactionsCard}>
            {accountTransactions.map((transaction, index) => {
              const category = categoryName(transaction.categoryId);
              return (
                <TransactionRow
                  key={transaction.id}
                  title={payeeName(transaction.payeeId)}
                  subtitle={
                    category ? `${formatDateShort(transaction.date)} · ${category}` : formatDateShort(transaction.date)
                  }
                  amount={transaction.amount}
                  currency={account.currency}
                  onPress={() => router.push(`/transaction/${transaction.id}`)}
                  isLast={index === accountTransactions.length - 1}
                />
              );
            })}
          </Card>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.sm,
    paddingBottom: Spacing.xl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  typeLabel: {
    opacity: 0.6,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  sectionTitle: {
    marginBottom: Spacing.xs,
  },
  transactionsCard: {
    paddingVertical: Spacing.xs,
  },
  spinner: {
    marginTop: Spacing.xl,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
