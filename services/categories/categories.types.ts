import { Category, CategoryGroup, CategoryMonth, Goal, GoalType, ID, MonthKey } from '@/types';

export interface CategoriesRepository {
  listGroups(): Promise<CategoryGroup[]>;
  listCategories(): Promise<Category[]>;
  listCategoryMonths(month: MonthKey): Promise<CategoryMonth[]>;
  listGoals(): Promise<Goal[]>;
  assign(categoryId: ID, month: MonthKey, assigned: number): Promise<CategoryMonth>;
  /** Adds `delta` to a category's activity for that month, creating the row if it
   *  doesn't exist yet. Used by the transactions service to keep activity in sync. */
  adjustActivity(categoryId: ID, month: MonthKey, delta: number): Promise<CategoryMonth>;
  createGroup(name: string, order: number): Promise<CategoryGroup>;
  updateGroup(id: ID, patch: Partial<Pick<CategoryGroup, 'name' | 'order'>>): Promise<CategoryGroup>;
  /** Hard delete — only ever called once the caller has verified the group has no
   *  categories left in it, so nothing is orphaned. */
  removeGroup(id: ID): Promise<void>;
  createCategory(input: { name: string; groupId: ID; order: number }): Promise<Category>;
  updateCategory(id: ID, patch: Partial<Pick<Category, 'name' | 'groupId'>>): Promise<Category>;
  /** Soft delete (sets `hidden`), never a hard delete — preserves the category's
   *  historical CategoryMonth rows and lets existing transactions keep referencing it. */
  hideCategory(id: ID): Promise<void>;
  createGoal(input: { categoryId: ID; type: GoalType; targetAmount: number; targetDate?: string }): Promise<Goal>;
  updateGoal(id: ID, patch: Partial<Pick<Goal, 'type' | 'targetAmount' | 'targetDate'>>): Promise<Goal>;
  /** Hard delete — a Goal is just a target, nothing else references it (unlike
   *  Categories/Payees, which Transactions reference by id), so nothing is orphaned. */
  removeGoal(id: ID): Promise<void>;
}
