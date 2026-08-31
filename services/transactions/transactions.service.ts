import { transactionsFirebaseRepository } from './transactions.firebase';
import { TransactionsRepository } from './transactions.types';

// Phase 6C: real Firestore-backed transactions, scoped to the authenticated user
// (users/{uid}/transactions). transactions.mock.ts is kept for reference but no longer used.
export const transactionsService: TransactionsRepository = transactionsFirebaseRepository;
