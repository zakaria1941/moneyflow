import { CurrencyCode, ID } from './common';

export interface UserProfile {
  uid: ID;
  displayName: string;
  email: string;
  currency: CurrencyCode;
  /** day of month the budget period starts, 1-28 */
  budgetStartDay?: number;
}
