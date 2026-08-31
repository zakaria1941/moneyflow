import { accountsFirebaseRepository } from './accounts.firebase';
import { AccountsRepository } from './accounts.types';

// Phase 6B: real Firestore-backed accounts, scoped to the authenticated user
// (users/{uid}/accounts). accounts.mock.ts is kept for reference but no longer used.
export const accountsService: AccountsRepository = accountsFirebaseRepository;
