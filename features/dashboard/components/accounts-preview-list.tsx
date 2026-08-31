import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AmountText } from '@/components/ui/amount-text';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ListRow } from '@/components/ui/list-row';
import { SectionHeader } from '@/components/ui/section-header';
import { Spacing } from '@/constants/theme';
import { ACCOUNT_TYPE_ICON, ACCOUNT_TYPE_LABEL } from '@/features/accounts/constants';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Account } from '@/types';

interface AccountsPreviewListProps {
  accounts: Account[];
}

const MAX_SHOWN = 4;

export function AccountsPreviewList({ accounts }: AccountsPreviewListProps) {
  const icon = useThemeColor({}, 'icon');
  const shown = accounts.slice(0, MAX_SHOWN);

  return (
    <View style={styles.container}>
      <SectionHeader title="Accounts" action={{ label: 'See all', onPress: () => router.push('/accounts') }} />
      <Card style={styles.card}>
        {accounts.length === 0 ? (
          <EmptyState
            title="No accounts yet"
            message="Add an account to start tracking your balances."
            action={{ label: 'Add Account', onPress: () => router.push('/account/new') }}
          />
        ) : (
          shown.map((account, index) => (
            <ListRow
              key={account.id}
              title={account.name}
              subtitle={ACCOUNT_TYPE_LABEL[account.type]}
              leading={<Ionicons name={ACCOUNT_TYPE_ICON[account.type]} size={18} color={icon} />}
              trailing={<AmountText amount={account.balance} currency={account.currency} colored={false} size={15} />}
              onPress={() => router.push(`/account/${account.id}`)}
              isLast={index === shown.length - 1}
            />
          ))
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
