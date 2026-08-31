import { ID, ISODateString } from './common';

export interface Transaction {
  id: ID;
  accountId: ID;
  payeeId?: ID;
  categoryId?: ID;
  /** minor units, negative = outflow, positive = inflow */
  amount: number;
  date: ISODateString;
  memo?: string;
  cleared?: boolean;
  /** set when this transaction is one leg of an account-to-account transfer */
  transferAccountId?: ID;
}

export type TransactionInput = Omit<Transaction, 'id'>;
