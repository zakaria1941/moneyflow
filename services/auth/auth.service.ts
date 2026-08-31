import { authFirebaseRepository, subscribeToAuthChanges } from './auth.firebase';
import { AuthRepository } from './auth.types';

// Phase 6A: real Firebase Authentication. auth.mock.ts is kept for reference but no
// longer controls whether users are authenticated.
export const authService: AuthRepository = authFirebaseRepository;
export { subscribeToAuthChanges };
