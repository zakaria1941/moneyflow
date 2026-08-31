import { delay } from '@/utils/delay';
import { generateId } from '@/utils/id';
import { AuthCredentials, AuthRepository, RegisterInput } from './auth.types';

// Placeholder only — accepts any well-formed email/password. Real Firebase Auth
// replaces this file's contents in the backend phase; auth.service.ts stays the same import.
export const authMockRepository: AuthRepository = {
  async login({ email, password }: AuthCredentials) {
    await delay(400);
    if (!email.includes('@') || password.length < 4) {
      throw new Error('Enter a valid email and a password of at least 4 characters.');
    }
    return { uid: 'mock-user', email };
  },
  async register({ email, password, displayName }: RegisterInput) {
    await delay(400);
    if (!email.includes('@') || password.length < 4 || !displayName.trim()) {
      throw new Error('Fill in your name, a valid email, and a password of at least 4 characters.');
    }
    return { uid: generateId('user'), email, displayName };
  },
  async logout() {
    await delay(150);
  },
  async requestPasswordReset(email: string) {
    await delay(400);
    if (!email.includes('@')) {
      throw new Error('Enter a valid email address.');
    }
  },
};
