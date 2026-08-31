import { create } from 'zustand';

import { transactionsService } from '@/services/transactions/transactions.service';
import { useAccountsStore } from '@/stores/accounts-store';
import { useCategoriesStore } from '@/stores/categories-store';
import { Transaction, TransactionInput } from '@/types';

/** The service already wrote the category-activity effect into the mock data; this just
 *  re-pulls the currently-viewed month so the Budget screen reflects it. Categories are
 *  only ever loaded one month at a time (see categories-store), so a transaction dated
 *  outside the currently-viewed month won't show live here until that month is loaded. */
function refreshCategoryMonth(): Promise<void> {
  return useCategoriesStore.getState().load(useCategoriesStore.getState().selectedMonth);
}

interface TransactionsState {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  load: () => Promise<void>;
  addTransaction: (input: TransactionInput) => Promise<void>;
  updateTransaction: (id: string, patch: Partial<TransactionInput>) => Promise<void>;
  removeTransaction: (id: string) => Promise<void>;
  clear: () => void;
}

export const useTransactionsStore = create<TransactionsState>((set, get) => ({
  transactions: [],
  isLoading: false,
  error: null,
  load: async () => {
    set({ isLoading: true, error: null });
    try {
      const transactions = await transactionsService.list();
      set({ transactions, isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: err instanceof Error ? err.message : 'Could not load transactions.' });
    }
  },
  addTransaction: async (input) => {
    const transaction = await transactionsService.create(input);
    set((s) => ({ transactions: [transaction, ...s.transactions] }));
    // The service already applied the balance/activity effects to the mock data; this
    // just pulls the fresh values into the accounts and categories stores so the UI reflects them.
    await Promise.all([useAccountsStore.getState().refreshAccount(transaction.accountId), refreshCategoryMonth()]);
  },
  updateTransaction: async (id, patch) => {
    const existing = get().transactions.find((t) => t.id === id);
    const transaction = await transactionsService.update(id, patch);
    set((s) => ({ transactions: s.transactions.map((t) => (t.id === id ? transaction : t)) }));
    const affectedAccountIds = new Set<string>([transaction.accountId]);
    if (existing) affectedAccountIds.add(existing.accountId);
    await Promise.all([
      ...[...affectedAccountIds].map((accountId) => useAccountsStore.getState().refreshAccount(accountId)),
      refreshCategoryMonth(),
    ]);
  },
  removeTransaction: async (id) => {
    const existing = get().transactions.find((t) => t.id === id);
    await transactionsService.remove(id);
    set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) }));
    if (existing) {
      await Promise.all([useAccountsStore.getState().refreshAccount(existing.accountId), refreshCategoryMonth()]);
    }
  },
  clear: () => set({ transactions: [], isLoading: false, error: null }),
}));
