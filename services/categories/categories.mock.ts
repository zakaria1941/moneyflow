import { Category, CategoryGroup, CategoryMonth, Goal, ID, MonthKey } from '@/types';
import { computeAvailable } from '@/utils/budget-math';
import { addMonths, currentMonthKey } from '@/utils/date';
import { delay } from '@/utils/delay';
import { generateId } from '@/utils/id';
import { CategoriesRepository } from './categories.types';

let groups: CategoryGroup[] = [
  { id: 'grp-immediate', name: 'Immediate Obligations', order: 1 },
  { id: 'grp-lifestyle', name: 'Quality of Life', order: 2 },
];

let categories: Category[] = [
  { id: 'cat-rent', groupId: 'grp-immediate', name: 'Rent', order: 1 },
  { id: 'cat-groceries', groupId: 'grp-immediate', name: 'Groceries', order: 2 },
  { id: 'cat-utilities', groupId: 'grp-immediate', name: 'Utilities', order: 3 },
  { id: 'cat-dining', groupId: 'grp-lifestyle', name: 'Dining Out', order: 1 },
  { id: 'cat-entertainment', groupId: 'grp-lifestyle', name: 'Entertainment', order: 2 },
  { id: 'cat-transport', groupId: 'grp-lifestyle', name: 'Transportation', order: 3 },
];

let categoryMonths: CategoryMonth[] = [
  { categoryId: 'cat-rent', month: currentMonthKey(), assigned: 150000, activity: -150000, available: 0 },
  { categoryId: 'cat-groceries', month: currentMonthKey(), assigned: 60000, activity: -42350, available: 17650 },
  { categoryId: 'cat-utilities', month: currentMonthKey(), assigned: 20000, activity: -18420, available: 1580 },
  { categoryId: 'cat-dining', month: currentMonthKey(), assigned: 15000, activity: -8900, available: 6100 },
  { categoryId: 'cat-entertainment', month: currentMonthKey(), assigned: 8000, activity: -3500, available: 4500 },
  { categoryId: 'cat-transport', month: currentMonthKey(), assigned: 12000, activity: -6750, available: 5250 },
];

let goals: Goal[] = [{ id: 'goal-rent', categoryId: 'cat-rent', type: 'monthly_funding', targetAmount: 150000 }];

function previousAvailableFor(categoryId: ID, month: MonthKey): number {
  const previousMonth = addMonths(month, -1);
  return categoryMonths.find((c) => c.categoryId === categoryId && c.month === previousMonth)?.available ?? 0;
}

export const categoriesMockRepository: CategoriesRepository = {
  async listGroups() {
    await delay();
    return groups;
  },
  async listCategories() {
    await delay();
    return categories;
  },
  async listCategoryMonths(month: MonthKey) {
    await delay();
    return categoryMonths.filter((c) => c.month === month);
  },
  async listGoals() {
    await delay();
    return goals;
  },
  async assign(categoryId: ID, month: MonthKey, assigned: number) {
    await delay();
    const existing = categoryMonths.find((c) => c.categoryId === categoryId && c.month === month);
    const activity = existing?.activity ?? 0;
    const updated: CategoryMonth = {
      categoryId,
      month,
      assigned,
      activity,
      available: computeAvailable(previousAvailableFor(categoryId, month), assigned, activity),
    };
    categoryMonths = existing
      ? categoryMonths.map((c) => (c.categoryId === categoryId && c.month === month ? updated : c))
      : [...categoryMonths, updated];
    return updated;
  },
  async adjustActivity(categoryId: ID, month: MonthKey, delta: number) {
    await delay();
    const existing = categoryMonths.find((c) => c.categoryId === categoryId && c.month === month);
    const assigned = existing?.assigned ?? 0;
    const activity = (existing?.activity ?? 0) + delta;
    const updated: CategoryMonth = {
      categoryId,
      month,
      assigned,
      activity,
      available: computeAvailable(previousAvailableFor(categoryId, month), assigned, activity),
    };
    categoryMonths = existing
      ? categoryMonths.map((c) => (c.categoryId === categoryId && c.month === month ? updated : c))
      : [...categoryMonths, updated];
    return updated;
  },
  async createGroup(name: string, order: number) {
    await delay();
    const group: CategoryGroup = { id: generateId('grp'), name, order };
    groups = [...groups, group];
    return group;
  },
  async updateGroup(id: ID, patch) {
    await delay();
    const existing = groups.find((g) => g.id === id);
    if (!existing) throw new Error(`Category group ${id} not found`);
    const updated = { ...existing, ...patch };
    groups = groups.map((g) => (g.id === id ? updated : g));
    return updated;
  },
  async removeGroup(id: ID) {
    await delay();
    groups = groups.filter((g) => g.id !== id);
  },
  async createCategory(input: { name: string; groupId: ID; order: number }) {
    await delay();
    const category: Category = { id: generateId('cat'), name: input.name, groupId: input.groupId, order: input.order };
    categories = [...categories, category];
    return category;
  },
  async updateCategory(id: ID, patch) {
    await delay();
    const existing = categories.find((c) => c.id === id);
    if (!existing) throw new Error(`Category ${id} not found`);
    const updated = { ...existing, ...patch };
    categories = categories.map((c) => (c.id === id ? updated : c));
    return updated;
  },
  async hideCategory(id: ID) {
    await delay();
    categories = categories.map((c) => (c.id === id ? { ...c, hidden: true } : c));
  },
  async createGoal(input) {
    await delay();
    const goal: Goal = { id: generateId('goal'), categoryId: input.categoryId, type: input.type, targetAmount: input.targetAmount, targetDate: input.targetDate };
    goals = [...goals, goal];
    return goal;
  },
  async updateGoal(id: ID, patch) {
    await delay();
    const existing = goals.find((g) => g.id === id);
    if (!existing) throw new Error(`Goal ${id} not found`);
    const updated = { ...existing, ...patch };
    goals = goals.map((g) => (g.id === id ? updated : g));
    return updated;
  },
  async removeGoal(id: ID) {
    await delay();
    goals = goals.filter((g) => g.id !== id);
  },
};
