import { Transaction, TransactionInput } from '@/types';
import { computeBalanceAdjustments, computeCategoryActivityAdjustments } from '@/utils/budget-math';
import { delay } from '@/utils/delay';
import { getMonthKey } from '@/utils/date';
import { generateId } from '@/utils/id';
import { applyBalanceAdjustments, applyCategoryActivityAdjustments } from './transaction-effects';
import { TransactionsRepository } from './transactions.types';

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

let transactions: Transaction[] = [
  { id: 'txn-001', accountId: 'acc-checking', payeeId: 'payee-employer', amount: 320000, date: daysAgo(14), memo: 'Biweekly paycheck', cleared: true },
  { id: 'txn-002', accountId: 'acc-checking', payeeId: 'payee-landlord', categoryId: 'cat-rent', amount: -150000, date: daysAgo(10), cleared: true },
  { id: 'txn-003', accountId: 'acc-checking', payeeId: 'payee-whole-foods', categoryId: 'cat-groceries', amount: -8200, date: daysAgo(9), cleared: true },
  { id: 'txn-004', accountId: 'acc-checking', payeeId: 'payee-trader-joes', categoryId: 'cat-groceries', amount: -15650, date: daysAgo(6), cleared: true },
  { id: 'txn-005', accountId: 'acc-checking', payeeId: 'payee-whole-foods', categoryId: 'cat-groceries', amount: -18500, date: daysAgo(2), cleared: false },
  { id: 'txn-006', accountId: 'acc-checking', payeeId: 'payee-city-utilities', categoryId: 'cat-utilities', amount: -18420, date: daysAgo(8), cleared: true },
  { id: 'txn-007', accountId: 'acc-credit-card', payeeId: 'payee-starbucks', categoryId: 'cat-dining', amount: -650, date: daysAgo(5), cleared: true },
  { id: 'txn-008', accountId: 'acc-credit-card', payeeId: 'payee-local-bistro', categoryId: 'cat-dining', amount: -8250, date: daysAgo(3), cleared: false },
  { id: 'txn-009', accountId: 'acc-credit-card', payeeId: 'payee-netflix', categoryId: 'cat-entertainment', amount: -1599, date: daysAgo(12), cleared: true },
  { id: 'txn-010', accountId: 'acc-credit-card', payeeId: 'payee-cinema-city', categoryId: 'cat-entertainment', amount: -1901, date: daysAgo(4), cleared: true },
  { id: 'txn-011', accountId: 'acc-credit-card', payeeId: 'payee-shell-gas', categoryId: 'cat-transport', amount: -3500, date: daysAgo(7), cleared: true },
  { id: 'txn-012', accountId: 'acc-credit-card', payeeId: 'payee-shell-gas', categoryId: 'cat-transport', amount: -3250, date: daysAgo(1), cleared: false },
];

export const transactionsMockRepository: TransactionsRepository = {
  async list() {
    await delay();
    return [...transactions].sort((a, b) => b.date.localeCompare(a.date));
  },
  async listByAccount(accountId) {
    await delay();
    return transactions.filter((t) => t.accountId === accountId).sort((a, b) => b.date.localeCompare(a.date));
  },
  async create(input: TransactionInput) {
    await delay();
    const transaction: Transaction = { id: generateId('txn'), ...input };
    transactions = [transaction, ...transactions];
    await applyBalanceAdjustments(
      computeBalanceAdjustments(null, { accountId: transaction.accountId, amount: transaction.amount })
    );
    await applyCategoryActivityAdjustments(
      computeCategoryActivityAdjustments(null, {
        categoryId: transaction.categoryId,
        month: getMonthKey(transaction.date),
        amount: transaction.amount,
      })
    );
    return transaction;
  },
  async update(id, patch) {
    await delay();
    const existing = transactions.find((t) => t.id === id);
    if (!existing) throw new Error(`Transaction ${id} not found`);
    const updated = { ...existing, ...patch };
    transactions = transactions.map((t) => (t.id === id ? updated : t));
    await applyBalanceAdjustments(
      computeBalanceAdjustments(
        { accountId: existing.accountId, amount: existing.amount },
        { accountId: updated.accountId, amount: updated.amount }
      )
    );
    await applyCategoryActivityAdjustments(
      computeCategoryActivityAdjustments(
        { categoryId: existing.categoryId, month: getMonthKey(existing.date), amount: existing.amount },
        { categoryId: updated.categoryId, month: getMonthKey(updated.date), amount: updated.amount }
      )
    );
    return updated;
  },
  async remove(id) {
    await delay();
    const existing = transactions.find((t) => t.id === id);
    transactions = transactions.filter((t) => t.id !== id);
    if (existing) {
      await applyBalanceAdjustments(
        computeBalanceAdjustments({ accountId: existing.accountId, amount: existing.amount }, null)
      );
      await applyCategoryActivityAdjustments(
        computeCategoryActivityAdjustments(
          { categoryId: existing.categoryId, month: getMonthKey(existing.date), amount: existing.amount },
          null
        )
      );
    }
  },
};
