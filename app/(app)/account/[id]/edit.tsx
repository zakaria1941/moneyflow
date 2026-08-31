import { useLocalSearchParams } from 'expo-router';

import { AddEditAccountScreen } from '@/features/accounts/screens/add-edit-account-screen';

export default function EditAccountRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <AddEditAccountScreen accountId={id} />;
}
