import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';

import { firebaseAuth } from '@/services/firebase/auth';
import { firestore } from '@/services/firebase/firestore';
import { ID, Transaction, TransactionInput } from '@/types';
import { computeBalanceAdjustments, computeCategoryActivityAdjustments } from '@/utils/budget-math';
import { getMonthKey } from '@/utils/date';
import { applyBalanceAdjustments, applyCategoryActivityAdjustments } from './transaction-effects';
import { TransactionsRepository } from './transactions.types';

function requireUid(): string {
  const uid = firebaseAuth.currentUser?.uid;
  if (!uid) throw new Error('No authenticated user.');
  return uid;
}

function transactionsCollection(uid: string) {
  return collection(firestore, 'users', uid, 'transactions');
}

function transactionDocRef(uid: string, id: ID) {
  return doc(firestore, 'users', uid, 'transactions', id);
}

/** Firestore rejects explicit `undefined` field values, but the add/edit transaction
 *  form sets optional fields (categoryId, payeeId, memo) to undefined when the user
 *  leaves them blank — strip those before every write instead of writing malformed
 *  documents. Omitting the key is equivalent to `undefined` for every reader in this
 *  codebase, since those fields are all optional on the Transaction type. */
function withoutUndefined<T extends object>(obj: T): T {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as T;
}

export const transactionsFirebaseRepository: TransactionsRepository = {
  async list() {
    const uid = requireUid();
    const snap = await getDocs(transactionsCollection(uid));
    return snap.docs.map((d) => d.data() as Transaction).sort((a, b) => b.date.localeCompare(a.date));
  },
  async listByAccount(accountId: ID) {
    const uid = requireUid();
    const snap = await getDocs(query(transactionsCollection(uid), where('accountId', '==', accountId)));
    return snap.docs.map((d) => d.data() as Transaction).sort((a, b) => b.date.localeCompare(a.date));
  },
  async create(input: TransactionInput) {
    const uid = requireUid();
    const ref = doc(transactionsCollection(uid)); // auto-generated document ID
    const transaction: Transaction = { id: ref.id, ...input };
    await setDoc(ref, withoutUndefined(transaction));
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
  async update(id: ID, patch) {
    const uid = requireUid();
    const ref = transactionDocRef(uid, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error(`Transaction ${id} not found`);
    const existing = snap.data() as Transaction;
    const updated: Transaction = { ...existing, ...patch };
    await setDoc(ref, withoutUndefined(updated));
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
  async remove(id: ID) {
    const uid = requireUid();
    const ref = transactionDocRef(uid, id);
    const snap = await getDoc(ref);
    const existing = snap.exists() ? (snap.data() as Transaction) : null;
    await deleteDoc(ref);
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
