import { CategoryMonth, Goal, MonthKey } from '@/types';

export function computeAvailable(previousAvailable: number, assigned: number, activity: number): number {
  return previousAvailable + assigned + activity;
}

export interface GoalProgress {
  /** minor units */
  current: number;
  /** minor units */
  target: number;
  /** 0–1, clamped; 0 when target is 0 or negative */
  fraction: number;
}

/**
 * A `monthly_funding` goal ("assign $300 to Groceries every month") is measured against
 * how much has been *assigned* this month — that's the thing the goal is actually asking
 * for. `target_balance` and `target_by_date` goals ("save up to $300") are measured
 * against `available`, since they're about accumulating a balance over time, not funding
 * a recurring amount. `available` is deliberately not used for every goal type — see the
 * monthly_funding case, where activity/spending has no bearing on whether this month's
 * funding target was met.
 */
export function computeGoalProgress(goal: Pick<Goal, 'type' | 'targetAmount'>, categoryMonth: CategoryMonth | undefined): GoalProgress {
  const current = goal.type === 'monthly_funding' ? (categoryMonth?.assigned ?? 0) : (categoryMonth?.available ?? 0);
  const target = goal.targetAmount;
  const fraction = target > 0 ? Math.min(Math.max(current / target, 0), 1) : 0;
  return { current, target, fraction };
}

export interface BalanceAdjustment {
  accountId: string;
  /** minor units to add to that account's balance */
  delta: number;
}

interface TransactionEffect {
  accountId: string;
  /** minor units, negative = outflow, positive = inflow */
  amount: number;
}

/**
 * Computes how account balances must change to move from `previous` to `next`.
 * Pass `previous: null` when creating a transaction, `next: null` when deleting one.
 * Handles same-account edits, account reassignment, and expense/income flips in one
 * pass so a balance effect is never double-counted or left un-reversed.
 */
export function computeBalanceAdjustments(
  previous: TransactionEffect | null,
  next: TransactionEffect | null
): BalanceAdjustment[] {
  if (previous && next && previous.accountId === next.accountId) {
    return [{ accountId: next.accountId, delta: next.amount - previous.amount }];
  }
  const adjustments: BalanceAdjustment[] = [];
  if (previous) adjustments.push({ accountId: previous.accountId, delta: -previous.amount });
  if (next) adjustments.push({ accountId: next.accountId, delta: next.amount });
  return adjustments;
}

export interface CategoryActivityAdjustment {
  categoryId: string;
  month: MonthKey;
  delta: number;
}

interface CategoryTransactionEffect {
  /** undefined when the transaction is uncategorized (e.g. income) — contributes to no category */
  categoryId?: string;
  month: MonthKey;
  amount: number;
}

/**
 * Same shape as computeBalanceAdjustments, but keyed on (categoryId, month) instead of
 * accountId, since CategoryMonth activity is tracked per month. Naturally handles a
 * category being reassigned, a transaction's date moving to a different month, and
 * uncategorized transactions (which affect no category) without special-casing any of
 * those as separate code paths.
 */
export function computeCategoryActivityAdjustments(
  previous: CategoryTransactionEffect | null,
  next: CategoryTransactionEffect | null
): CategoryActivityAdjustment[] {
  const prevKey = previous?.categoryId ? `${previous.categoryId}:${previous.month}` : null;
  const nextKey = next?.categoryId ? `${next.categoryId}:${next.month}` : null;

  if (prevKey && nextKey && prevKey === nextKey && previous && next) {
    return [{ categoryId: next.categoryId!, month: next.month, delta: next.amount - previous.amount }];
  }
  const adjustments: CategoryActivityAdjustment[] = [];
  if (previous?.categoryId) {
    adjustments.push({ categoryId: previous.categoryId, month: previous.month, delta: -previous.amount });
  }
  if (next?.categoryId) {
    adjustments.push({ categoryId: next.categoryId, month: next.month, delta: next.amount });
  }
  return adjustments;
}
