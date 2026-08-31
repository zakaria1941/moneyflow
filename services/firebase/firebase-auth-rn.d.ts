// `@firebase/auth` exposes `getReactNativePersistence` only behind a "react-native"
// package-export condition. Metro resolves that fine at build time, but plain `tsc`
// (as run by `tsc --noEmit`) doesn't apply that condition and falls back to the
// default (web) type declarations, which omit it. This augmentation restores it for
// typechecking only — it has no effect on the actual runtime module resolved by Metro.
export {};

declare module 'firebase/auth' {
  interface ReactNativeAsyncStorageLike {
    setItem(key: string, value: string): Promise<void>;
    getItem(key: string): Promise<string | null>;
    removeItem(key: string): Promise<void>;
  }

  export function getReactNativePersistence(storage: ReactNativeAsyncStorageLike): Persistence;
}
