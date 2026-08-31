import { ID, UserProfile } from '@/types';
import { delay } from '@/utils/delay';
import { ProfileRepository } from './profile.types';

let profiles: UserProfile[] = [
  { uid: 'mock-user', displayName: 'Alex Morgan', email: 'alex@example.com', currency: 'USD', budgetStartDay: 1 },
];

export const profileMockRepository: ProfileRepository = {
  async get(uid: ID) {
    await delay();
    return profiles.find((p) => p.uid === uid) ?? null;
  },
  async upsert(profile: UserProfile) {
    await delay();
    const exists = profiles.some((p) => p.uid === profile.uid);
    profiles = exists ? profiles.map((p) => (p.uid === profile.uid ? profile : p)) : [...profiles, profile];
    return profile;
  },
  async update(uid: ID, patch) {
    await delay();
    const existing = profiles.find((p) => p.uid === uid);
    if (!existing) throw new Error(`Profile ${uid} not found`);
    const updated = { ...existing, ...patch };
    profiles = profiles.map((p) => (p.uid === uid ? updated : p));
    return updated;
  },
};
