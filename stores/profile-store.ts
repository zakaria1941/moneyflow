import { create } from 'zustand';

import { profileService } from '@/services/profile/profile.service';
import { UserProfile } from '@/types';

interface ProfileState {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  load: (uid: string, fallback?: Pick<UserProfile, 'displayName' | 'email'>) => Promise<void>;
  updateProfile: (patch: Partial<Omit<UserProfile, 'uid'>>) => Promise<void>;
  clear: () => void;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  isLoading: false,
  error: null,
  load: async (uid, fallback) => {
    set({ isLoading: true, error: null });
    try {
      let profile = await profileService.get(uid);
      if (!profile) {
        profile = await profileService.upsert({
          uid,
          displayName: fallback?.displayName ?? 'New User',
          email: fallback?.email ?? '',
          currency: 'USD',
          budgetStartDay: 1,
        });
      }
      set({ profile, isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: err instanceof Error ? err.message : 'Could not load profile.' });
    }
  },
  updateProfile: async (patch) => {
    const current = get().profile;
    if (!current) return;
    const updated = await profileService.update(current.uid, patch);
    set({ profile: updated });
  },
  clear: () => set({ profile: null, isLoading: false, error: null }),
}));
