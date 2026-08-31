import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { SectionHeader } from '@/components/ui/section-header';
import { TransactionRow } from '@/components/ui/transaction-row';
import { Spacing } from '@/constants/theme';
import { Category, CurrencyCode, Payee, Transaction } from '@/types';
import { formatDateShort } from '@/utils/date';

interface RecentTransactionsListProps {
  transactions: Transaction[];
  payees: Payee[];
  categories: Category[];
  currency: CurrencyCode;
}

const MAX_SHOWN = 5;

export function RecentTransactionsList({ transactions, payees, categories, currency }: RecentTransactionsListProps) {
  const recent = transactions.slice(0, MAX_SHOWN);
  const payeeName = (payeeId?: string) => payees.find((p) => p.id === payeeId)?.name ?? 'Unknown payee';
  // A hidden category still resolves its name here (it's not removed from `categories`,
  // just filtered out of active pickers elsewhere) — preserves historical context instead
  // of showing "Uncategorized" for a transaction that really does have a category.
  const categoryName = (categoryId?: string) => categories.find((c) => c.id === categoryId)?.name;

  return (
    <View style={styles.container}>
      <SectionHeader title="Recent Transactions" action={{ label: 'See all', onPress: () => router.push('/transaction') }} />
      <Card style={styles.card}>
        {recent.length === 0 ? (
          <EmptyState
            title="No transactions yet"
            message="Your recent spending and income will appear here."
            action={{ label: 'Add Transaction', onPress: () => router.push('/transaction/new') }}
          />
        ) : (
          recent.map((transaction, index) => {
            const category = categoryName(transaction.categoryId);
            const subtitle = category
              ? `${category} · ${formatDateShort(transaction.date)}`
              : formatDateShort(transaction.date);
            return (
              <TransactionRow
                key={transaction.id}
                title={payeeName(transaction.payeeId)}
                subtitle={subtitle}
                amount={transaction.amount}
                currency={currency}
                onPress={() => router.push(`/transaction/${transaction.id}`)}
                isLast={index === recent.length - 1}
              />
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
  },
});
