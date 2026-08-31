import { CurrencyCode, ID, ISODateString } from './common';

export type AccountType = 'checking' | 'savings' | 'cash' | 'credit_card';

export interface Account {
  id: ID;
  name: string;
  type: AccountType;
  /** minor units (cents) */
  balance: number;
  currency: CurrencyCode;
  isClosed?: boolean;
  createdAt: ISODateString;
}

export type AccountInput = {
  name: string;
  type: AccountType;
  currency: CurrencyCode;
  /** minor units (cents) */
  startingBalance: number;
};
