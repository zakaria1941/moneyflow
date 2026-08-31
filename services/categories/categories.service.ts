import { categoriesFirebaseRepository } from './categories.firebase';
import { CategoriesRepository } from './categories.types';

// Phase 6D: real Firestore-backed categories/budget, scoped to the authenticated user
// (users/{uid}/categoryGroups, categories, categoryMonths, goals). categories.mock.ts is
// kept for reference but no longer used.
export const categoriesService: CategoriesRepository = categoriesFirebaseRepository;
