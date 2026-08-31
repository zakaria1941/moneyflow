import { ID } from './common';

export interface Payee {
  id: ID;
  name: string;
  archived?: boolean;
}
