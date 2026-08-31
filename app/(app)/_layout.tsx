import { Stack } from 'expo-router';
import { useEffect } from 'react';

import { useAccountsStore } from '@/stores/accounts-store';
import { useAuthStore } from '@/stores/auth-store';
import { useCategoriesStore } from '@/stores/categories-store';
import { usePayeesStore } from '@/stores/payees-store';
import { useProfileStore } from '@/stores/profile-store';
import { useTransactionsStore } from '@/stores/transactions-store';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function AppLayout() {
  const session = useAuthStore((s) => s.session);
  const loadAccounts = useAccountsStore((s) => s.load);
  const loadTransactions = useTransactionsStore((s) => s.load);
  const loadCategories = useCategoriesStore((s) => s.load);
  const loadPayees = usePayeesStore((s) => s.load);
  const loadProfile = useProfileStore((s) => s.load);

  useEffect(() => {
    if (!session) return;
    loadAccounts();
    loadTransactions();
    loadCategories();
    loadPayees();
    loadProfile(session.uid, { displayName: session.displayName ?? '', email: session.email });
  }, [session, loadAccounts, loadTransactions, loadCategories, loadPayees, loadProfile]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="account/[id]" options={{ headerShown: true, title: 'Account' }} />
      <Stack.Screen name="account/new" options={{ presentation: 'modal', headerShown: true, title: 'Add Account' }} />
      <Stack.Screen
        name="account/[id]/edit"
        options={{ presentation: 'modal', headerShown: true, title: 'Edit Account' }}
      />
      <Stack.Screen name="transaction/index" options={{ headerShown: true, title: 'Transactions' }} />
      <Stack.Screen name="transaction/[id]" options={{ headerShown: true, title: 'Transaction' }} />
      <Stack.Screen
        name="transaction/new"
        options={{ presentation: 'modal', headerShown: true, title: 'Add Transaction' }}
      />
      <Stack.Screen
        name="transaction/[id]/edit"
        options={{ presentation: 'modal', headerShown: true, title: 'Edit Transaction' }}
      />
      <Stack.Screen name="category/index" options={{ headerShown: true, title: 'Categories' }} />
      <Stack.Screen name="payee/index" options={{ headerShown: true, title: 'Payees' }} />
    </Stack>
  );
}
