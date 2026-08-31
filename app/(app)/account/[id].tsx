import { useLocalSearchParams } from 'expo-router';

import { AccountDetailScreen } from '@/features/accounts/screens/account-detail-screen';

export default function AccountDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <AccountDetailScreen accountId={id} />;
}
