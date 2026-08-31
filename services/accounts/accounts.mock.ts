import { Account, AccountInput, ID } from '@/types';
import { delay } from '@/utils/delay';
import { generateId } from '@/utils/id';
import { AccountsRepository } from './accounts.types';

let accounts: Account[] = [
  { id: 'acc-checking', name: 'Checking', type: 'checking', balance: 245075, currency: 'USD', createdAt: '2026-01-01' },
  { id: 'acc-savings', name: 'Savings', type: 'savings', balance: 820000, currency: 'USD', createdAt: '2026-01-01' },
  { id: 'acc-credit-card', name: 'Credit Card', type: 'credit_card', balance: -34218, currency: 'USD', createdAt: '2026-01-01' },
  { id: 'acc-cash', name: 'Cash', type: 'cash', balance: 6000, currency: 'USD', createdAt: '2026-01-01' },
];

export const accountsMockRepository: AccountsRepository = {
  async list() {
    await delay();
    return accounts.filter((a) => !a.isClosed);
  },
  async get(id: ID) {
    await delay();
    return accounts.find((a) => a.id === id) ?? null;
  },
  async create(input: AccountInput) {
    await delay();
    const account: Account = {
      id: generateId('acc'),
      name: input.name,
      type: input.type,
      currency: input.currency,
      balance: input.startingBalance,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    accounts = [...accounts, account];
    return account;
  },
  async update(id: ID, patch) {
    await delay();
    const existing = accounts.find((a) => a.id === id);
    if (!existing) throw new Error(`Account ${id} not found`);
    const updated: Account = { ...existing, ...patch };
    accounts = accounts.map((a) => (a.id === id ? updated : a));
    return updated;
  },
  async remove(id: ID) {
    await delay();
    accounts = accounts.filter((a) => a.id !== id);
  },
};
