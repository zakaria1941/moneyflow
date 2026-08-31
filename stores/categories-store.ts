import { create } from 'zustand';

import { categoriesService } from '@/services/categories/categories.service';
import { Category, CategoryGroup, CategoryMonth, Goal, GoalType, ID } from '@/types';
import { addMonths, currentMonthKey } from '@/utils/date';

interface CategoriesState {
  groups: CategoryGroup[];
  categories: Category[];
  categoryMonths: CategoryMonth[];
  goals: Goal[];
  selectedMonth: string;
  isLoading: boolean;
  error: string | null;
  load: (month?: string) => Promise<void>;
  nextMonth: () => Promise<void>;
  previousMonth: () => Promise<void>;
  assign: (categoryId: string, assigned: number) => Promise<void>;
  totalAssigned: () => number;
  totalActivity: () => number;
  totalAvailable: () => number;
  createGroup: (name: string) => Promise<void>;
  updateGroup: (id: ID, patch: Partial<Pick<CategoryGroup, 'name' | 'order'>>) => Promise<void>;
  /** Throws if the group still has categories in it — caller (the screen) surfaces that
   *  as a validation message rather than silently failing or orphaning categories. */
  removeGroup: (id: ID) => Promise<void>;
  createCategory: (name: string, groupId: ID) => Promise<void>;
  updateCategory: (id: ID, patch: Partial<Pick<Category, 'name' | 'groupId'>>) => Promise<void>;
  hideCategory: (id: ID) => Promise<void>;
  createGoal: (input: { categoryId: ID; type: GoalType; targetAmount: number; targetDate?: string }) => Promise<void>;
  updateGoal: (id: ID, patch: Partial<Pick<Goal, 'type' | 'targetAmount' | 'targetDate'>>) => Promise<void>;
  removeGoal: (id: ID) => Promise<void>;
  clear: () => void;
}

export const useCategoriesStore = create<CategoriesState>((set, get) => ({
  groups: [],
  categories: [],
  categoryMonths: [],
  goals: [],
  selectedMonth: currentMonthKey(),
  isLoading: false,
  error: null,
  load: async (month) => {
    const targetMonth = month ?? get().selectedMonth;
    set({ isLoading: true, error: null, selectedMonth: targetMonth });
    try {
      const [groups, categories, categoryMonths, goals] = await Promise.all([
        categoriesService.listGroups(),
        categoriesService.listCategories(),
        categoriesService.listCategoryMonths(targetMonth),
        categoriesService.listGoals(),
      ]);
      set({ groups, categories, categoryMonths, goals, isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: err instanceof Error ? err.message : 'Could not load budget.' });
    }
  },
  nextMonth: async () => {
    await get().load(addMonths(get().selectedMonth, 1));
  },
  previousMonth: async () => {
    await get().load(addMonths(get().selectedMonth, -1));
  },
  assign: async (categoryId, assigned) => {
    const month = get().selectedMonth;
    const updated = await categoriesService.assign(categoryId, month, assigned);
    set((s) => ({
      categoryMonths: s.categoryMonths.some((c) => c.categoryId === categoryId && c.month === month)
        ? s.categoryMonths.map((c) => (c.categoryId === categoryId && c.month === month ? updated : c))
        : [...s.categoryMonths, updated],
    }));
  },
  totalAssigned: () => get().categoryMonths.reduce((sum, c) => sum + c.assigned, 0),
  totalActivity: () => get().categoryMonths.reduce((sum, c) => sum + c.activity, 0),
  totalAvailable: () => get().categoryMonths.reduce((sum, c) => sum + c.available, 0),
  createGroup: async (name) => {
    const order = get().groups.length + 1;
    const group = await categoriesService.createGroup(name, order);
    set((s) => ({ groups: [...s.groups, group] }));
  },
  updateGroup: async (id, patch) => {
    const updated = await categoriesService.updateGroup(id, patch);
    set((s) => ({ groups: s.groups.map((g) => (g.id === id ? updated : g)) }));
  },
  removeGroup: async (id) => {
    // Hidden categories don't block this — they're already invisible everywhere
    // (Budget, this same management screen), so a hidden category left pointing at a
    // deleted group causes no visible or functional problem, and requiring the user to
    // deal with categories they can no longer even see would be confusing.
    const hasVisibleCategories = get().categories.some((c) => c.groupId === id && !c.hidden);
    if (hasVisibleCategories) {
      throw new Error('Remove this group’s categories first.');
    }
    await categoriesService.removeGroup(id);
    set((s) => ({ groups: s.groups.filter((g) => g.id !== id) }));
  },
  createCategory: async (name, groupId) => {
    const order = get().categories.filter((c) => c.groupId === groupId).length + 1;
    const category = await categoriesService.createCategory({ name, groupId, order });
    set((s) => ({ categories: [...s.categories, category] }));
  },
  updateCategory: async (id, patch) => {
    const updated = await categoriesService.updateCategory(id, patch);
    set((s) => ({ categories: s.categories.map((c) => (c.id === id ? updated : c)) }));
  },
  hideCategory: async (id) => {
    await categoriesService.hideCategory(id);
    set((s) => ({ categories: s.categories.map((c) => (c.id === id ? { ...c, hidden: true } : c)) }));
  },
  createGoal: async (input) => {
    const goal = await categoriesService.createGoal(input);
    set((s) => ({ goals: [...s.goals, goal] }));
  },
  updateGoal: async (id, patch) => {
    const updated = await categoriesService.updateGoal(id, patch);
    set((s) => ({ goals: s.goals.map((g) => (g.id === id ? updated : g)) }));
  },
  removeGoal: async (id) => {
    await categoriesService.removeGoal(id);
    set((s) => ({ goals: s.goals.filter((g) => g.id !== id) }));
  },
  clear: () =>
    set({
      groups: [],
      categories: [],
      categoryMonths: [],
      goals: [],
      selectedMonth: currentMonthKey(),
      isLoading: false,
      error: null,
    }),
}));
