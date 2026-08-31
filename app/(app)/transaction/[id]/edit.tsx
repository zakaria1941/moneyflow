import { useLocalSearchParams } from 'expo-router';

import { AddEditTransactionScreen } from '@/features/transactions/screens/add-edit-transaction-screen';

export default function EditTransactionRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <AddEditTransactionScreen transactionId={id} />;
}
