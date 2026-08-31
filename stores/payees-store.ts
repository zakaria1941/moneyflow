import { create } from 'zustand';

import { payeesService } from '@/services/payees/payees.service';
import { ID, Payee } from '@/types';

interface PayeesState {
  payees: Payee[];
  isLoading: boolean;
  error: string | null;
  load: () => Promise<void>;
  addPayee: (name: string) => Promise<Payee>;
  updatePayee: (id: ID, name: string) => Promise<void>;
  archivePayee: (id: ID) => Promise<void>;
  clear: () => void;
}

export const usePayeesStore = create<PayeesState>((set) => ({
  payees: [],
  isLoading: false,
  error: null,
  load: async () => {
    set({ isLoading: true, error: null });
    try {
      const payees = await payeesService.list();
      set({ payees, isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: err instanceof Error ? err.message : 'Could not load payees.' });
    }
  },
  addPayee: async (name) => {
    const payee = await payeesService.create(name);
    set((s) => ({ payees: [...s.payees, payee] }));
    return payee;
  },
  updatePayee: async (id, name) => {
    const updated = await payeesService.update(id, name);
    set((s) => ({ payees: s.payees.map((p) => (p.id === id ? updated : p)) }));
  },
  archivePayee: async (id) => {
    await payeesService.archive(id);
    set((s) => ({ payees: s.payees.filter((p) => p.id !== id) }));
  },
  clear: () => set({ payees: [], isLoading: false, error: null }),
}));
