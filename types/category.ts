import { ID, MonthKey } from './common';

export interface CategoryGroup {
  id: ID;
  name: string;
  order: number;
}

export interface Category {
  id: ID;
  groupId: ID;
  name: string;
  order: number;
  hidden?: boolean;
}

/** One row per category per month — the actual "budget" numbers. */
export interface CategoryMonth {
  categoryId: ID;
  month: MonthKey;
  /** minor units */
  assigned: number;
  /** minor units, negative = spending */
  activity: number;
  /** minor units, = previous month's available + assigned + activity */
  available: number;
}

export type GoalType = 'target_balance' | 'monthly_funding' | 'target_by_date';

export interface Goal {
  id: ID;
  categoryId: ID;
  type: GoalType;
  /** minor units */
  targetAmount: number;
  targetDate?: string;
}
