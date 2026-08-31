import { collection, deleteDoc, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';

import { firebaseAuth } from '@/services/firebase/auth';
import { firestore } from '@/services/firebase/firestore';
import { Account, AccountInput, ID } from '@/types';
import { AccountsRepository } from './accounts.types';

function requireUid(): string {
  const uid = firebaseAuth.currentUser?.uid;
  if (!uid) throw new Error('No authenticated user.');
  return uid;
}

function accountsCollection(uid: string) {
  return collection(firestore, 'users', uid, 'accounts');
}

function accountDocRef(uid: string, id: ID) {
  return doc(firestore, 'users', uid, 'accounts', id);
}

export const accountsFirebaseRepository: AccountsRepository = {
  async list() {
    const uid = requireUid();
    const snap = await getDocs(accountsCollection(uid));
    // Filtered client-side, matching the mock's own logic — isClosed is optional, and
    // most documents won't have it set at all, which a Firestore "!=" filter would
    // incorrectly exclude (inequality filters require the field to exist to match).
    return snap.docs.map((d) => d.data() as Account).filter((a) => !a.isClosed);
  },
  async get(id: ID) {
    const uid = requireUid();
    const snap = await getDoc(accountDocRef(uid, id));
    return snap.exists() ? (snap.data() as Account) : null;
  },
  async create(input: AccountInput) {
    const uid = requireUid();
    const ref = doc(accountsCollection(uid)); // auto-generated document ID
    const account: Account = {
      id: ref.id,
      name: input.name,
      type: input.type,
      currency: input.currency,
      balance: input.startingBalance,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    await setDoc(ref, account);
    return account;
  },
  async update(id: ID, patch) {
    const uid = requireUid();
    const ref = accountDocRef(uid, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error(`Account ${id} not found`);
    const updated: Account = { ...(snap.data() as Account), ...patch };
    await setDoc(ref, updated);
    return updated;
  },
  async remove(id: ID) {
    const uid = requireUid();
    await deleteDoc(accountDocRef(uid, id));
  },
};
