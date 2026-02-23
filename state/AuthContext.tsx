import { createContext, useCallback, useContext, useEffect, useState } from 'react';
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
    // Failsafe: never stay loading for more than 15 seconds
    // (increased from 8s to allow for TLS provider install + warmup retry on Android)
    const timeout = setTimeout(() => setLoading(false), 15_000);

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

  const signOut = async () => {
    await supabase.auth.signOut();
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
