import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthContextValue {
  /** Current authenticated user ID, or null if not signed in. */
  userId: string | null;
  /** Full Supabase user object. */
  user: User | null;
  /** Supabase session. */
  session: Session | null;
  /** True while restoring session from SecureStore. */
  loading: boolean;
  /** Sign out and clear session. */
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Failsafe: never stay loading for more than 5 seconds
    const timeout = setTimeout(() => setLoading(false), 5_000);

    // Restore session on mount
    supabase.auth
      .getSession()
      .then(({ data: { session: s } }) => {
        setSession(s);
      })
      .catch(() => {
        // Network or storage error — continue as signed out
      })
      .finally(() => {
        clearTimeout(timeout);
        setLoading(false);
      });

    // Listen for auth changes (sign in, sign out, token refresh)
    let subscription: { unsubscribe: () => void } | null = null;
    try {
      const result = supabase.auth.onAuthStateChange((_event, s) => {
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

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        userId: session?.user?.id ?? null,
        user: session?.user ?? null,
        session,
        loading,
        signOut,
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
