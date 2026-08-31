import { ID, Payee } from '@/types';

export interface PayeesRepository {
  list(): Promise<Payee[]>;
  create(name: string): Promise<Payee>;
  update(id: ID, name: string): Promise<Payee>;
  /** Soft delete (sets `archived`), never a hard delete — existing transactions keep
   *  referencing the payee's id and still resolve its name. */
  archive(id: ID): Promise<void>;
}
