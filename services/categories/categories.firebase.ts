import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';

import { firebaseAuth } from '@/services/firebase/auth';
import { firestore } from '@/services/firebase/firestore';
import { Category, CategoryGroup, CategoryMonth, Goal, ID, MonthKey } from '@/types';
import { computeAvailable } from '@/utils/budget-math';
import { addMonths } from '@/utils/date';
import { CategoriesRepository } from './categories.types';

function requireUid(): string {
  const uid = firebaseAuth.currentUser?.uid;
  if (!uid) throw new Error('No authenticated user.');
  return uid;
}

function groupsCollection(uid: string) {
  return collection(firestore, 'users', uid, 'categoryGroups');
}

function categoriesCollection(uid: string) {
  return collection(firestore, 'users', uid, 'categories');
}

function categoryMonthsCollection(uid: string) {
  return collection(firestore, 'users', uid, 'categoryMonths');
}

function goalsCollection(uid: string) {
  return collection(firestore, 'users', uid, 'goals');
}

/** CategoryMonth rows are keyed by (categoryId, month), so a deterministic doc ID lets
 *  assign()/adjustActivity() target a row directly instead of querying for it. */
function categoryMonthDocRef(uid: string, categoryId: ID, month: MonthKey) {
  return doc(firestore, 'users', uid, 'categoryMonths', `${categoryId}_${month}`);
}

function goalDocRef(uid: string, id: ID) {
  return doc(firestore, 'users', uid, 'goals', id);
}

/** Firestore rejects explicit `undefined` field values. A Goal's `targetDate` is only
 *  meaningful for target_by_date goals, so it's conditionally present — strip it (and any
 *  other undefined key) before every write rather than writing a malformed document. */
function withoutUndefined<T extends object>(obj: T): T {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as T;
}

/** Reads the previous month's stored `available` for one category — the carryover base
 *  for whatever the caller is computing for the current month. 0 if that category has no
 *  row yet for the previous month (a brand-new category, or the very first month anyone
 *  has assigned/spent against it). */
async function getPreviousAvailable(uid: string, categoryId: ID, month: MonthKey): Promise<number> {
  const previousMonth = addMonths(month, -1);
  const snap = await getDoc(categoryMonthDocRef(uid, categoryId, previousMonth));
  return snap.exists() ? (snap.data() as CategoryMonth).available : 0;
}

// There is no UI anywhere in the app to create a category or group (app/(app)/category/index.tsx
// is an unimplemented placeholder) — assign() only edits an existing category's monthly amount.
// Without seeding, a new user would have zero categories forever with no way to ever add one.
// So the first time a user's groups/categories are empty, seed the same starter structure the
// mock always provided — names and grouping only, no fake assigned/activity numbers.
const DEFAULT_GROUPS: CategoryGroup[] = [
  { id: 'grp-immediate', name: 'Immediate Obligations', order: 1 },
  { id: 'grp-lifestyle', name: 'Quality of Life', order: 2 },
];

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-rent', groupId: 'grp-immediate', name: 'Rent', order: 1 },
  { id: 'cat-groceries', groupId: 'grp-immediate', name: 'Groceries', order: 2 },
  { id: 'cat-utilities', groupId: 'grp-immediate', name: 'Utilities', order: 3 },
  { id: 'cat-dining', groupId: 'grp-lifestyle', name: 'Dining Out', order: 1 },
  { id: 'cat-entertainment', groupId: 'grp-lifestyle', name: 'Entertainment', order: 2 },
  { id: 'cat-transport', groupId: 'grp-lifestyle', name: 'Transportation', order: 3 },
];

export const categoriesFirebaseRepository: CategoriesRepository = {
  async listGroups() {
    const uid = requireUid();
    const snap = await getDocs(groupsCollection(uid));
    if (snap.empty) {
      await Promise.all(DEFAULT_GROUPS.map((g) => setDoc(doc(groupsCollection(uid), g.id), g)));
      return DEFAULT_GROUPS;
    }
    return snap.docs.map((d) => d.data() as CategoryGroup);
  },
  async listCategories() {
    const uid = requireUid();
    const snap = await getDocs(categoriesCollection(uid));
    if (snap.empty) {
      await Promise.all(DEFAULT_CATEGORIES.map((c) => setDoc(doc(categoriesCollection(uid), c.id), c)));
      return DEFAULT_CATEGORIES;
    }
    return snap.docs.map((d) => d.data() as Category);
  },
  async listCategoryMonths(month: MonthKey) {
    const uid = requireUid();
    const [categoriesSnap, monthsSnap] = await Promise.all([
      getDocs(categoriesCollection(uid)),
      getDocs(query(categoryMonthsCollection(uid), where('month', '==', month))),
    ]);
    const activeCategoryIds = categoriesSnap.docs
      .map((d) => d.data() as Category)
      .filter((c) => !c.hidden)
      .map((c) => c.id);
    const byCategory = new Map(monthsSnap.docs.map((d) => [(d.data() as CategoryMonth).categoryId, d.data() as CategoryMonth]));

    // Every active category should have a row for a month once it's been viewed, even if
    // untouched, so its available balance correctly carries forward from the previous
    // month instead of silently resetting to 0 the first time this month is opened.
    const missingIds = activeCategoryIds.filter((id) => !byCategory.has(id));
    if (missingIds.length > 0) {
      await Promise.all(
        missingIds.map(async (categoryId) => {
          const previousAvailable = await getPreviousAvailable(uid, categoryId, month);
          const materialized: CategoryMonth = {
            categoryId,
            month,
            assigned: 0,
            activity: 0,
            available: computeAvailable(previousAvailable, 0, 0),
          };
          await setDoc(categoryMonthDocRef(uid, categoryId, month), materialized);
          byCategory.set(categoryId, materialized);
        })
      );
    }
    return activeCategoryIds.map((id) => byCategory.get(id)!);
  },
  async listGoals() {
    const uid = requireUid();
    const snap = await getDocs(goalsCollection(uid));
    return snap.docs.map((d) => d.data() as Goal);
  },
  async assign(categoryId: ID, month: MonthKey, assigned: number) {
    const uid = requireUid();
    const ref = categoryMonthDocRef(uid, categoryId, month);
    const [snap, previousAvailable] = await Promise.all([getDoc(ref), getPreviousAvailable(uid, categoryId, month)]);
    const existing = snap.exists() ? (snap.data() as CategoryMonth) : undefined;
    const activity = existing?.activity ?? 0;
    const updated: CategoryMonth = { categoryId, month, assigned, activity, available: computeAvailable(previousAvailable, assigned, activity) };
    await setDoc(ref, updated);
    return updated;
  },
  async adjustActivity(categoryId: ID, month: MonthKey, delta: number) {
    const uid = requireUid();
    const ref = categoryMonthDocRef(uid, categoryId, month);
    const [snap, previousAvailable] = await Promise.all([getDoc(ref), getPreviousAvailable(uid, categoryId, month)]);
    const existing = snap.exists() ? (snap.data() as CategoryMonth) : undefined;
    const assigned = existing?.assigned ?? 0;
    const activity = (existing?.activity ?? 0) + delta;
    const updated: CategoryMonth = { categoryId, month, assigned, activity, available: computeAvailable(previousAvailable, assigned, activity) };
    await setDoc(ref, updated);
    return updated;
  },
  async createGroup(name: string, order: number) {
    const uid = requireUid();
    const ref = doc(groupsCollection(uid));
    const group: CategoryGroup = { id: ref.id, name, order };
    await setDoc(ref, group);
    return group;
  },
  async updateGroup(id: ID, patch) {
    const uid = requireUid();
    const ref = doc(groupsCollection(uid), id);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error(`Category group ${id} not found`);
    const updated: CategoryGroup = { ...(snap.data() as CategoryGroup), ...patch };
    await setDoc(ref, updated);
    return updated;
  },
  async removeGroup(id: ID) {
    const uid = requireUid();
    await deleteDoc(doc(groupsCollection(uid), id));
  },
  async createCategory(input: { name: string; groupId: ID; order: number }) {
    const uid = requireUid();
    const ref = doc(categoriesCollection(uid));
    const category: Category = { id: ref.id, name: input.name, groupId: input.groupId, order: input.order };
    await setDoc(ref, category);
    return category;
  },
  async updateCategory(id: ID, patch) {
    const uid = requireUid();
    const ref = doc(categoriesCollection(uid), id);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error(`Category ${id} not found`);
    const updated: Category = { ...(snap.data() as Category), ...patch };
    await setDoc(ref, updated);
    return updated;
  },
  async hideCategory(id: ID) {
    const uid = requireUid();
    const ref = doc(categoriesCollection(uid), id);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error(`Category ${id} not found`);
    const updated: Category = { ...(snap.data() as Category), hidden: true };
    await setDoc(ref, updated);
  },
  async createGoal(input) {
    const uid = requireUid();
    const ref = doc(goalsCollection(uid));
    const goal: Goal = { id: ref.id, categoryId: input.categoryId, type: input.type, targetAmount: input.targetAmount, targetDate: input.targetDate };
    await setDoc(ref, withoutUndefined(goal));
    return goal;
  },
  async updateGoal(id: ID, patch) {
    const uid = requireUid();
    const ref = goalDocRef(uid, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error(`Goal ${id} not found`);
    const updated: Goal = { ...(snap.data() as Goal), ...patch };
    await setDoc(ref, withoutUndefined(updated));
    return updated;
  },
  async removeGoal(id: ID) {
    const uid = requireUid();
    await deleteDoc(goalDocRef(uid, id));
  },
};
