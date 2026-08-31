import { ID, UserProfile } from '@/types';

export interface ProfileRepository {
  get(uid: ID): Promise<UserProfile | null>;
  upsert(profile: UserProfile): Promise<UserProfile>;
  update(uid: ID, patch: Partial<Omit<UserProfile, 'uid'>>): Promise<UserProfile>;
}
