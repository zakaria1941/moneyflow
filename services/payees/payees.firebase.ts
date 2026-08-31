import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';

import { firebaseAuth } from '@/services/firebase/auth';
import { firestore } from '@/services/firebase/firestore';
import { ID, Payee } from '@/types';
import { PayeesRepository } from './payees.types';

function requireUid(): string {
  const uid = firebaseAuth.currentUser?.uid;
  if (!uid) throw new Error('No authenticated user.');
  return uid;
}

function payeesCollection(uid: string) {
  return collection(firestore, 'users', uid, 'payees');
}

export const payeesFirebaseRepository: PayeesRepository = {
  async list() {
    const uid = requireUid();
    const snap = await getDocs(payeesCollection(uid));
    // Unlike accounts, archived payees are NOT filtered out here — matches
    // categories.firebase.ts's listCategories(), which also returns hidden ones. Existing
    // transactions must keep resolving an archived payee's real name (list/detail screens
    // just look it up in this array), so filtering happens only where a NEW selection is
    // offered (the transaction form, the management screen), never at the data-fetch layer.
    return snap.docs.map((d) => d.data() as Payee);
  },
  async create(name: string) {
    const uid = requireUid();
    const ref = doc(payeesCollection(uid));
    const payee: Payee = { id: ref.id, name };
    await setDoc(ref, payee);
    return payee;
  },
  async update(id: ID, name: string) {
    const uid = requireUid();
    const ref = doc(payeesCollection(uid), id);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error(`Payee ${id} not found`);
    const updated: Payee = { ...(snap.data() as Payee), name };
    await setDoc(ref, updated);
    return updated;
  },
  async archive(id: ID) {
    const uid = requireUid();
    const ref = doc(payeesCollection(uid), id);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error(`Payee ${id} not found`);
    const updated: Payee = { ...(snap.data() as Payee), archived: true };
    await setDoc(ref, updated);
  },
};
