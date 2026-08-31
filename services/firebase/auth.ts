import AsyncStorage from '@react-native-async-storage/async-storage';
import { Auth, getAuth, getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { Platform } from 'react-native';

import { firebaseApp } from './config';

function createFirebaseAuth(): Auth {
  if (Platform.OS === 'web') {
    return getAuth(firebaseApp);
  }
  try {
    return initializeAuth(firebaseApp, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    // initializeAuth throws if it's already been called for this app (e.g. Fast Refresh
    // re-evaluating this module) — fall back to the instance that already exists.
    return getAuth(firebaseApp);
  }
}

export const firebaseAuth = createFirebaseAuth();
