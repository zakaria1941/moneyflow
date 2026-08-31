import { accountsService } from '@/services/accounts/accounts.service';
import { categoriesService } from '@/services/categories/categories.service';
import { BalanceAdjustment, CategoryActivityAdjustment } from '@/utils/budget-math';

/** Applies computed balance deltas through the accounts service's public API — never
 *  reaches into a specific accounts implementation directly, so this works whether
 *  accountsService is mock- or Firestore-backed. Shared by every transactions
 *  repository implementation so the sync logic exists in exactly one place. */
export async function applyBalanceAdjustments(adjustments: BalanceAdjustment[]): Promise<void> {
  await Promise.all(
    adjustments
      .filter((a) => a.delta !== 0)
      .map(async ({ accountId, delta }) => {
        const account = await accountsService.get(accountId);
        if (!account) return;
        await accountsService.update(accountId, { balance: account.balance + delta });
      })
  );
}

/** Same idea as applyBalanceAdjustments, for the category a transaction is tagged with
 *  (if any) — keeps CategoryMonth.activity in sync with the transaction log.
 *
 *  Unlike applyBalanceAdjustments, these must run in sequence, not in parallel. When a
 *  transaction's date moves across a month boundary, computeCategoryActivityAdjustments
 *  returns a reversal for the old month followed by an application for the new month —
 *  and each adjustActivity call recomputes `available` by reading the *previous* month's
 *  stored available as its carryover base. If the new month happens to be right after the
 *  old one, its carryover read would race the old month's own write: running both
 *  concurrently could read the old month's pre-reversal available, double-counting the
 *  activity into the new month's balance. Awaiting each one before starting the next
 *  guarantees the reversal is fully committed before anything reads it as carryover. */
export async function applyCategoryActivityAdjustments(adjustments: CategoryActivityAdjustment[]): Promise<void> {
  for (const { categoryId, month, delta } of adjustments) {
    if (delta === 0) continue;
    await categoriesService.adjustActivity(categoryId, month, delta);
  }
}
