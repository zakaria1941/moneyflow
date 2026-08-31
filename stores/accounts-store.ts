import { create } from 'zustand';

import { accountsService } from '@/services/accounts/accounts.service';
import { Account, AccountInput } from '@/types';

interface AccountsState {
  accounts: Account[];
  isLoading: boolean;
  error: string | null;
  load: () => Promise<void>;
  addAccount: (input: AccountInput) => Promise<void>;
  updateAccount: (id: string, patch: Partial<Omit<Account, 'id' | 'createdAt'>>) => Promise<void>;
  removeAccount: (id: string) => Promise<void>;
  /** Soft delete: marks the account closed and drops it from the active list, without
   *  touching its transaction history (hard-deleting would orphan those records). */
  archiveAccount: (id: string) => Promise<void>;
  /** Re-pulls one account from the service — used after a transaction write changes its balance. */
  refreshAccount: (id: string) => Promise<void>;
  totalBalance: () => number;
  clear: () => void;
}

export const useAccountsStore = create<AccountsState>((set, get) => ({
  accounts: [],
  isLoading: false,
  error: null,
  load: async () => {
    set({ isLoading: true, error: null });
    try {
      const accounts = await accountsService.list();
      set({ accounts, isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: err instanceof Error ? err.message : 'Could not load accounts.' });
    }
  },
  addAccount: async (input) => {
    const account = await accountsService.create(input);
    set((s) => ({ accounts: [...s.accounts, account] }));
  },
  updateAccount: async (id, patch) => {
    const account = await accountsService.update(id, patch);
    set((s) => ({ accounts: s.accounts.map((a) => (a.id === id ? account : a)) }));
  },
  removeAccount: async (id) => {
    await accountsService.remove(id);
    set((s) => ({ accounts: s.accounts.filter((a) => a.id !== id) }));
  },
  archiveAccount: async (id) => {
    await accountsService.update(id, { isClosed: true });
    set((s) => ({ accounts: s.accounts.filter((a) => a.id !== id) }));
  },
  refreshAccount: async (id) => {
    const account = await accountsService.get(id);
    if (account) {
      set((s) => ({ accounts: s.accounts.map((a) => (a.id === id ? account : a)) }));
    }
  },
  totalBalance: () => get().accounts.reduce((sum, a) => sum + a.balance, 0),
  clear: () => set({ accounts: [], isLoading: false, error: null }),
}));
