import { Category, MonthKey, Transaction } from '@/types';

export interface CategorySpending {
  categoryId: string;
  categoryName: string;
  /** minor units, positive */
  amount: number;
}

export function getSpendingByCategory(
  transactions: Transaction[],
  categories: Category[],
  month: MonthKey
): CategorySpending[] {
  const byCategory = new Map<string, number>();
  for (const t of transactions) {
    if (!t.date.startsWith(month) || t.amount >= 0 || !t.categoryId) continue;
    byCategory.set(t.categoryId, (byCategory.get(t.categoryId) ?? 0) + Math.abs(t.amount));
  }
  return Array.from(byCategory.entries())
    .map(([categoryId, amount]) => ({
      categoryId,
      categoryName: categories.find((c) => c.id === categoryId)?.name ?? 'Uncategorized',
      amount,
    }))
    .sort((a, b) => b.amount - a.amount);
}

export function getIncomeVsExpense(transactions: Transaction[], month: MonthKey) {
  return transactions
    .filter((t) => t.date.startsWith(month))
    .reduce(
      (totals, t) => {
        if (t.amount >= 0) totals.income += t.amount;
        else totals.expense += Math.abs(t.amount);
        return totals;
      },
      { income: 0, expense: 0 }
    );
}
