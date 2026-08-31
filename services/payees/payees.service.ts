import { payeesFirebaseRepository } from './payees.firebase';
import { PayeesRepository } from './payees.types';

// Phase 8: real Firestore-backed payees, scoped to the authenticated user
// (users/{uid}/payees). payees.mock.ts is kept for reference but no longer used.
export const payeesService: PayeesRepository = payeesFirebaseRepository;
