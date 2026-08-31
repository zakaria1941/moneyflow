import { Ionicons } from '@expo/vector-icons';

import { AmountText } from '@/components/ui/amount-text';
import { ListRow } from '@/components/ui/list-row';
import { ACCOUNT_TYPE_ICON, ACCOUNT_TYPE_LABEL } from '@/features/accounts/constants';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Account } from '@/types';

interface AccountListItemProps {
  account: Account;
  onPress: () => void;
  isLast?: boolean;
}

export function AccountListItem({ account, onPress, isLast }: AccountListItemProps) {
  const icon = useThemeColor({}, 'icon');

  return (
    <ListRow
      title={account.name}
      subtitle={ACCOUNT_TYPE_LABEL[account.type]}
      leading={<Ionicons name={ACCOUNT_TYPE_ICON[account.type]} size={20} color={icon} />}
      trailing={<AmountText amount={account.balance} currency={account.currency} colored={false} />}
      onPress={onPress}
      isLast={isLast}
    />
  );
}
