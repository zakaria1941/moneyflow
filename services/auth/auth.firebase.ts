import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile as updateFirebaseProfile,
  type User,
} from 'firebase/auth';

import { firebaseAuth } from '@/services/firebase/auth';
import { AuthCredentials, AuthRepository, AuthSession, RegisterInput } from './auth.types';

function toSession(user: User): AuthSession {
  return { uid: user.uid, email: user.email ?? '', displayName: user.displayName ?? undefined };
}

/** Firebase throws opaque error codes (e.g. "auth/invalid-credential") — translate the
 *  ones users can actually hit here into plain messages instead of surfacing them raw. */
function mapAuthError(error: unknown): string {
  const code = error && typeof error === 'object' && 'code' in error ? String((error as { code: unknown }).code) : '';
  switch (code) {
    case 'auth/invalid-email':
      return 'Enter a valid email address.';
    case 'auth/weak-password':
      return 'Choose a password with at least 6 characters.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Incorrect email or password.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

export const authFirebaseRepository: AuthRepository = {
  async login({ email, password }: AuthCredentials) {
    try {
      const credential = await signInWithEmailAndPassword(firebaseAuth, email, password);
      return toSession(credential.user);
    } catch (err) {
      throw new Error(mapAuthError(err));
    }
  },
  async register({ email, password, displayName }: RegisterInput) {
    try {
      const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      const trimmedName = displayName.trim();
      if (trimmedName) {
        await updateFirebaseProfile(credential.user, { displayName: trimmedName });
      }
      return { uid: credential.user.uid, email: credential.user.email ?? email, displayName: trimmedName || undefined };
    } catch (err) {
      throw new Error(mapAuthError(err));
    }
  },
  async logout() {
    await signOut(firebaseAuth);
  },
  async requestPasswordReset(email: string) {
    try {
      await sendPasswordResetEmail(firebaseAuth, email);
    } catch (err) {
      throw new Error(mapAuthError(err));
    }
  },
};

/** Fires once immediately with the persisted session (if any), then on every sign-in/out.
 *  This is what makes auth persistence work — the store subscribes to this at startup. */
export function subscribeToAuthChanges(callback: (session: AuthSession | null) => void): () => void {
  return onAuthStateChanged(firebaseAuth, (user) => {
    callback(user ? toSession(user) : null);
  });
}
