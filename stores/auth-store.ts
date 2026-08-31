import { create } from 'zustand';

import { authService, subscribeToAuthChanges } from '@/services/auth/auth.service';
import { AuthSession } from '@/services/auth/auth.types';
import { useAccountsStore } from '@/stores/accounts-store';
import { useCategoriesStore } from '@/stores/categories-store';
import { usePayeesStore } from '@/stores/payees-store';
import { useProfileStore } from '@/stores/profile-store';
import { useTransactionsStore } from '@/stores/transactions-store';

// Zustand stores are module-level singletons that outlive a logged-out user's screens —
// without this, a second user logging in on the same device would briefly see the first
// user's stale accounts/transactions/budget/profile while the fresh loads are in flight.
function clearUserStores() {
  useProfileStore.getState().clear();
  useAccountsStore.getState().clear();
  useTransactionsStore.getState().clear();
  useCategoriesStore.getState().clear();
  usePayeesStore.getState().clear();
}

interface AuthState {
  session: AuthSession | null;
  isAuthenticated: boolean;
  /** True until Firebase reports whether a persisted session exists. Gates the root
   *  layout so a returning logged-in user doesn't flash through the Welcome screen. */
  isInitializing: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (displayName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // True only while login()/register() is actively establishing a session. Those
  // actions resolve with the complete, correct session (register() sets the Firebase
  // displayName before returning) — but Firebase's own onAuthStateChanged can fire
  // moments earlier, mid-registration, for a user that doesn't have the display name
  // set yet. Left unguarded, that premature event used to reach the app first and
  // cause the Firestore profile to be created with a blank name. Suppressing the
  // listener while an action is in flight means only the complete session is ever
  // propagated; the listener's normal job — startup session restoration, detecting
  // sign-out — is unaffected once the action finishes.
  let suppressListener = false;

  // Starts the moment this module is first imported. Firebase restores any persisted
  // session from AsyncStorage and fires this at least once (even with no user).
  subscribeToAuthChanges((session) => {
    if (suppressListener) return;
    if (!session) clearUserStores();
    set({ session, isAuthenticated: !!session, isInitializing: false });
  });

  return {
    session: null,
    isAuthenticated: false,
    isInitializing: true,
    isLoading: false,
    error: null,
    login: async (email, password) => {
      set({ isLoading: true, error: null });
      suppressListener = true;
      try {
        const session = await authService.login({ email, password });
        set({ session, isAuthenticated: true, isLoading: false });
      } catch (err) {
        set({ isLoading: false, error: err instanceof Error ? err.message : 'Failed to sign in.' });
        throw err;
      } finally {
        suppressListener = false;
      }
    },
    register: async (displayName, email, password) => {
      set({ isLoading: true, error: null });
      suppressListener = true;
      try {
        const session = await authService.register({ displayName, email, password });
        set({ session, isAuthenticated: true, isLoading: false });
      } catch (err) {
        set({ isLoading: false, error: err instanceof Error ? err.message : 'Failed to create account.' });
        throw err;
      } finally {
        suppressListener = false;
      }
    },
    logout: async () => {
      await authService.logout();
      clearUserStores();
      set({ session: null, isAuthenticated: false });
    },
    requestPasswordReset: async (email) => {
      set({ isLoading: true, error: null });
      try {
        await authService.requestPasswordReset(email);
        set({ isLoading: false });
      } catch (err) {
        set({ isLoading: false, error: err instanceof Error ? err.message : 'Failed to send reset email.' });
        throw err;
      }
    },
    clearError: () => set({ error: null }),
  };
});
