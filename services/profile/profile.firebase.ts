import { doc, getDoc, setDoc } from 'firebase/firestore';

import { firestore } from '@/services/firebase/firestore';
import { ID, UserProfile } from '@/types';
import { ProfileRepository } from './profile.types';

function profileDocRef(uid: ID) {
  return doc(firestore, 'users', uid);
}

export const profileFirebaseRepository: ProfileRepository = {
  async get(uid: ID) {
    const snap = await getDoc(profileDocRef(uid));
    return snap.exists() ? (snap.data() as UserProfile) : null;
  },
  async upsert(profile: UserProfile) {
    await setDoc(profileDocRef(profile.uid), profile);
    return profile;
  },
  async update(uid: ID, patch) {
    const snap = await getDoc(profileDocRef(uid));
    if (!snap.exists()) throw new Error(`Profile ${uid} not found`);
    const updated: UserProfile = { ...(snap.data() as UserProfile), ...patch };
    await setDoc(profileDocRef(uid), updated);
    return updated;
  },
};
