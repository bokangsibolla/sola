import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, warmupConnection } from '@/lib/supabase';

interface AuthContextValue {
  /** Current authenticated user ID, or null if not signed in. */
  userId: string | null;
  /** Full Supabase user object. */
  user: User | null;
  /** Supabase session. */
  session: Session | null;
  /** True while restoring session from storage. */
  loading: boolean;
  /** Sign out and clear session. */
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Failsafe: never stay loading for more than 8 seconds
    // (increased from 5s to allow for connection warmup on Android)
    const timeout = setTimeout(() => setLoading(false), 8_000);

    // On Android, warm up the OkHttp connection pool BEFORE making auth calls.
    // This prevents "Network request failed" errors caused by cold-start failures.
    warmupConnection()
      .then((connected) => {
        if (!connected) {
          console.warn(
            '[Sola] Connection warmup failed — Supabase may be unreachable. Continuing anyway.',
          );
        }
      })
      .catch(() => {
        // Non-fatal: warmup is best-effort
      })
      .finally(() => {
        // Now restore session — the connection pool should be primed
        supabase.auth
          .getSession()
          .then(({ data: { session: s } }) => {
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
