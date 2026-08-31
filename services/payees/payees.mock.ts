import { ID, Payee } from '@/types';
import { delay } from '@/utils/delay';
import { generateId } from '@/utils/id';
import { PayeesRepository } from './payees.types';

let payees: Payee[] = [
  { id: 'payee-employer', name: 'Employer Payroll' },
  { id: 'payee-landlord', name: 'Landlord' },
  { id: 'payee-whole-foods', name: 'Whole Foods' },
  { id: 'payee-trader-joes', name: "Trader Joe's" },
  { id: 'payee-city-utilities', name: 'City Power & Water' },
  { id: 'payee-starbucks', name: 'Starbucks' },
  { id: 'payee-local-bistro', name: 'Local Bistro' },
  { id: 'payee-netflix', name: 'Netflix' },
  { id: 'payee-cinema-city', name: 'Cinema City' },
  { id: 'payee-shell-gas', name: 'Shell Gas Station' },
];

export const payeesMockRepository: PayeesRepository = {
  async list() {
    await delay();
    return payees.filter((p) => !p.archived);
  },
  async create(name: string) {
    await delay();
    const payee: Payee = { id: generateId('payee'), name };
    payees = [...payees, payee];
    return payee;
  },
  async update(id: ID, name: string) {
    await delay();
    const existing = payees.find((p) => p.id === id);
    if (!existing) throw new Error(`Payee ${id} not found`);
    const updated = { ...existing, name };
    payees = payees.map((p) => (p.id === id ? updated : p));
    return updated;
  },
  async archive(id: ID) {
    await delay();
    payees = payees.map((p) => (p.id === id ? { ...p, archived: true } : p));
  },
};
