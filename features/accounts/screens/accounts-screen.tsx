import { router } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AmountText } from '@/components/ui/amount-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import { AccountListItem } from '@/features/accounts/components/account-list-item';
import { ACCOUNT_TYPE_LABEL } from '@/features/accounts/constants';
import { useAccountsStore } from '@/stores/accounts-store';
import { useProfileStore } from '@/stores/profile-store';
import { AccountType } from '@/types';

const TYPE_ORDER: AccountType[] = ['checking', 'savings', 'cash', 'credit_card'];

export function AccountsScreen() {
  const accounts = useAccountsStore((s) => s.accounts);
  const isLoading = useAccountsStore((s) => s.isLoading);
  const totalBalance = useAccountsStore((s) => s.totalBalance());
  const currency = useProfileStore((s) => s.profile?.currency ?? 'USD');

  const groups = TYPE_ORDER.map((type) => ({
    type,
    accounts: accounts.filter((a) => a.type === type),
  })).filter((group) => group.accounts.length > 0);

  return (
    <Screen scroll>
      <View style={styles.header}>
        <ThemedText type="title">Accounts</ThemedText>
        <Button title="Add" onPress={() => router.push('/account/new')} />
      </View>

      {isLoading && accounts.length === 0 ? (
        <ActivityIndicator style={styles.spinner} />
      ) : accounts.length === 0 ? (
        <EmptyState
          title="No accounts yet"
          message="Add a checking, savings, cash, or credit card account to get started."
          action={{ label: 'Add Account', onPress: () => router.push('/account/new') }}
        />
      ) : (
        <View style={styles.content}>
          <Card style={styles.totalCard}>
            <ThemedText style={styles.totalLabel}>Total available</ThemedText>
            <AmountText amount={totalBalance} currency={currency} size={32} colored={false} />
          </Card>

          {groups.map((group) => (
            <View key={group.type} style={styles.group}>
              <ThemedText type="defaultSemiBold" style={styles.groupTitle}>
                {ACCOUNT_TYPE_LABEL[group.type]}
              </ThemedText>
              <Card style={styles.groupCard}>
                {group.accounts.map((account, index) => (
                  <AccountListItem
                    key={account.id}
                    account={account}
                    onPress={() => router.push(`/account/${account.id}`)}
                    isLast={index === group.accounts.length - 1}
                  />
                ))}
              </Card>
            </View>
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  spinner: {
    marginTop: Spacing.xl,
  },
  content: {
    gap: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  totalCard: {
    gap: Spacing.xs,
  },
  totalLabel: {
    opacity: 0.6,
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
