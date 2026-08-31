import { ID, Transaction, TransactionInput } from '@/types';

export interface TransactionsRepository {
  list(): Promise<Transaction[]>;
  listByAccount(accountId: ID): Promise<Transaction[]>;
  create(input: TransactionInput): Promise<Transaction>;
  update(id: ID, patch: Partial<TransactionInput>): Promise<Transaction>;
  remove(id: ID): Promise<void>;
}
