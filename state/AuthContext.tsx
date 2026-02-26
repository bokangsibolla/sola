import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';

interface SignOutOptions {
  /** Use revokeAccess instead of signOut for Google — forces account picker next time. */
  revokeGoogle?: boolean;
}

interface AuthContextValue {
  /** Current authenticated user ID, or null if not signed in. */
  userId: string | null;
  /** Full Supabase user object. */
  user: User | null;
  /** Supabase session. */
  session: Session | null;
  /** True while restoring session from storage. */
  loading: boolean;
  /** Sign out and clear session. Pass { revokeGoogle: true } for account deletion. */
  signOut: (opts?: SignOutOptions) => Promise<void>;
  /**
   * Re-read session from Supabase storage and update React state.
   * Returns true if a valid session was found.
   * Use this before redirecting away from authenticated screens to avoid
   * false redirects caused by stale React state.
   */
  recoverSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Failsafe: never stay loading for more than 8 seconds
    const timeout = setTimeout(() => setLoading(false), 8_000);

    // Restore session from storage
    supabase.auth
      .getSession()
      .then(({ data: { session: s } }) => {
        console.log('[Sola Auth] Initial getSession:', s ? `userId=${s.user.id.substring(0, 8)}` : 'null');
        setSession(s);
      })
      .catch((err) => {
        // Network or storage error — continue as signed out
        console.warn('[Sola] getSession failed:', err?.message);
      })
      .finally(() => {
        clearTimeout(timeout);
        setLoading(false);
      });

    // Listen for auth changes (sign in, sign out, token refresh)
    let subscription: { unsubscribe: () => void } | null = null;
    try {
      const result = supabase.auth.onAuthStateChange((event, s) => {
        console.log(`[Sola Auth] Event: ${event}, hasSession: ${!!s}, userId: ${s?.user?.id?.substring(0, 8) ?? 'null'}`);
        setSession(s);
      });
      subscription = result.data.subscription;
    } catch {
      // Supabase client may be broken if env vars are missing
    }

    return () => {
      clearTimeout(timeout);
      subscription?.unsubscribe();
    };
  }, []);

  const signOut = async (opts?: SignOutOptions) => {
    // Use 'local' scope — clears AsyncStorage first, then attempts API revocation.
    // Default 'global' scope makes an API call first, and if it fails (e.g. network
    // issues on Android), the local session is NOT cleared — causing auto-re-login.
    try {
      await supabase.auth.signOut({ scope: 'local' });
    } catch {
      // Even if signOut fails, force-clear the stored session
      await AsyncStorage.removeItem('sb-bfyewxgdfkmkviajmfzp-auth-token');
    }

    // Clear Google cached credential so the account picker shows next time.
    // Must configure first — GoogleSignin is a singleton that loses config on app restart.
    try {
      const { GoogleSignin } = require('@react-native-google-signin/google-signin');
      GoogleSignin.configure({
        webClientId: '234937383727-2oj58631smi815k534jn2k5lfdvlup06.apps.googleusercontent.com',
      });
      if (opts?.revokeGoogle) {
        // revokeAccess disconnects the app entirely — forces account picker + consent.
        // Use for account deletion where we want a clean break.
        await GoogleSignin.revokeAccess();
      } else {
        await GoogleSignin.signOut();
      }
    } catch {
      // Ignore — module may not be available or user didn't sign in with Google
    }

    setSession(null);
  };

  const recoverSession = useCallback(async (): Promise<boolean> => {
    try {
      const { data: { session: s } } = await supabase.auth.getSession();
      console.log('[Sola Auth] recoverSession:', s ? `userId=${s.user.id.substring(0, 8)}` : 'null');
      if (s) {
        setSession(s);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        userId: session?.user?.id ?? null,
        user: session?.user ?? null,
        session,
        loading,
        signOut,
        recoverSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
