import { Account, AccountInput, ID } from '@/types';

export interface AccountsRepository {
  list(): Promise<Account[]>;
  get(id: ID): Promise<Account | null>;
  create(input: AccountInput): Promise<Account>;
  update(id: ID, patch: Partial<Omit<Account, 'id' | 'createdAt'>>): Promise<Account>;
  remove(id: ID): Promise<void>;
}
