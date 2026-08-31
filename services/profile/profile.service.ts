import { profileFirebaseRepository } from './profile.firebase';
import { ProfileRepository } from './profile.types';

// Phase 6A: real Firestore-backed profile. profile.mock.ts is kept for reference but no
// longer used.
export const profileService: ProfileRepository = profileFirebaseRepository;
